import type { ClientEngine, TaskEntityCreateOptions } from '@lib/types/interfaces';
import type { ClientManager } from '@lib/structures//ClientManager';
import type { KlasaClient, TimeResolvable } from 'klasa';
import { TaskEntity, ResponseValue, ResponseType } from '@lib/orm/entities/TaskEntity';
import { DbManager } from '@orm/DbManager';
import { Cron } from '@klasa/cron';
import { isNullish } from '@utils/util';
import { TimerManager } from '@klasa/timer-manager';
import { ClientEvents } from '@klasa/core';

export class TaskManager implements ClientEngine, Iterable<TaskEntity> {

	public queue: TaskEntity[] = [];

	#interval: NodeJS.Timer | null = null; // eslint-disable-line @typescript-eslint/explicit-member-accessibility

	public constructor(public readonly manager: ClientManager) { }

	public get client(): KlasaClient {
		return this.manager.client;
	}

	public async init(): Promise<void> {
		const { tasks } = await DbManager.connect();
		const found = await tasks.find();

		for (const entry of found) this._insert(entry.setup(this).resume());
		this._checkInterval();
	}

	public async add(taskID: string, timeResolvable: TimeResolvable, options: TaskEntityCreateOptions = {}): Promise<TaskEntity> {
		if (!this.client.tasks.has(taskID)) throw new Error(`The task '${taskID}' does not exist.`);

		const [time, cron] = this._resolveTime(timeResolvable);
		const entry = new TaskEntity();
		entry.taskID = taskID;
		entry.time = time;
		entry.recurring = cron;
		entry.catchUp = options.catchUp ?? true;
		entry.data = options.data ?? {};
		await entry.save();

		this._insert(entry.setup(this).resume());
		this._checkInterval();
		return entry;
	}

	public async remove(entityOrID: TaskEntity | TaskEntity['id']): Promise<boolean> {
		if (typeof entityOrID === 'number') {
			entityOrID = this.queue.find((entity): boolean => entity.id === entityOrID)!;
			if (isNullish(entityOrID)) return false;
		}

		const entity = entityOrID as TaskEntity;
		await entity.pause().remove();
		this._remove(entity);
		this._checkInterval();
		return true;
	}

	public async execute(): Promise<void> {
		if (this.queue.length) {
			const now = Date.now();
			const execute = [];

			for (const entry of this) {
				if (entry.time.getTime() > now) break;
				execute.push(entry.run());
			}

			if (execute.length === 0) return;
			await this._handleResponses(await Promise.all(execute));
		}

		this._checkInterval();
	}

	public *[Symbol.iterator](): IterableIterator<TaskEntity> {
		yield *this.queue;
	}

	private _insert(entity: TaskEntity): void {
		const index = this.queue.findIndex((entry): boolean => entry.time > entity.time);
		if (index === -1) this.queue.push(entity);
		else this.queue.splice(index, 0, entity);
	}

	private _remove(entity: TaskEntity): void {
		const index = this.queue.findIndex((entry): boolean => entry === entity);
		if (index !== -1) this.queue.splice(index, 1);
	}

	private async _handleResponses(responses: readonly ResponseValue[]): Promise<void> {
		const connection = await DbManager.connect();
		const queryRunner = connection.startQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		const updated: TaskEntity[] = [];
		const removed: TaskEntity[] = [];
		try {
			for (const response of responses) {
				response.entry.pause();

				switch (response.type) {
					case ResponseType.Delay: {
						// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
						response.entry.time = new Date(response.entry.time.getTime() + response.value);
						updated.push(response.entry);
						await queryRunner.manager.save(response.entry);
					}
					case ResponseType.Finished: {
						removed.push(response.entry);
						await queryRunner.manager.remove(response.entry);
					}
					case ResponseType.Ignore: {
						continue;
					}
					case ResponseType.Update: {
						response.entry.time = response.value;
						updated.push(response.entry);
						await queryRunner.manager.save(response.entry);
					}
				}
			}

			await queryRunner.commitTransaction();

			for (const entry of removed) {
				this._remove(entry);
			}

			for (const entry of updated) {
				const index = this.queue.findIndex((entity): boolean => entity === entry);
				if (index === -1) continue;

				this.queue.splice(index, 1);
				this._insert(entry);

				entry.resume();
			}
		} catch (error) {
			this.client.emit(ClientEvents.WTF, error);

			await queryRunner.rollbackTransaction();

			await Promise.all(updated.map((entry): Promise<void> => entry.reload()));
		} finally {
			await queryRunner.release();
		}
	}

	private _clearInterval(): void {
		if (!isNullish(this.#interval)) {
			TimerManager.clearInterval(this.#interval);
			this.#interval = null;
		}
	}

	private _checkInterval(): void {
		if (!this.queue.length) this._clearInterval();
		else if (isNullish(this.#interval)) this.#interval = TimerManager.setInterval(this.execute.bind(this), this.client.options.schedule.interval);
	}

	private _resolveTime(time: TimeResolvable): [Date, Cron | null] {
		if (time instanceof Date) return [time, null];
		if (time instanceof Cron) return [time.next(), time];
		if (typeof time === 'number') return [new Date(time), null];
		if (typeof time === 'string') {
			const cron = new Cron(time);
			return [cron.next(), cron];
		}
		throw new TypeError('Invalid time passed');
	}

}
