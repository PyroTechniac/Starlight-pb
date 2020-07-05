import { Cache } from '@klasa/cache';
import type { Client } from '@klasa/core';
import type { ClientManager } from '@lib/structures/ClientManager';
import type { ClientEngine, TaskEntityCreateOptions } from '@lib/types/interfaces';
import { DbManager } from '@orm/DbManager';
import { TaskEntity } from '@orm/entities/TaskEntity';
import { isNullish } from '@utils/util';
import { TimerManager } from '@klasa/timer-manager';


export class TaskManager extends Cache<string, TaskEntity> implements ClientEngine {

	#interval: NodeJS.Timer | null = null; // eslint-disable-line @typescript-eslint/explicit-member-accessibility

	public constructor(public readonly manager: ClientManager) {
		super();
	}

	public get client(): Client {
		return this.manager.client;
	}

	public async init(): Promise<void> {
		const manager = await DbManager.connect();
		const tasks = await manager.tasks.find();

		for (const task of tasks) {
			await this._insert(task.setup(this));
		}
	}

	public async create(data: TaskEntityCreateOptions): Promise<TaskEntity> {
		const manager = await DbManager.connect();
		const entity = new TaskEntity()
			.setup(this)
			.setTaskName(data.name)
			.setTime(data.time)
			.setData(data.data ?? {})
			.setCatchUp(data.catchUp ?? true);

		await this._insert(entity);

		this._checkInterval();

		return manager.tasks.save(entity);
	}

	public async remove(id: string): Promise<TaskEntity | null> {
		const manager = await DbManager.connect();
		const entity = super.get(id) || await manager.tasks.findOne({ id });
		if (isNullish(entity)) return null;
		return entity.setup(this).delete();
	}

	public async removeAll(): Promise<void> {
		const manager = await DbManager.connect();
		await manager.tasks.clear();
	}

	protected async execute(): Promise<void> {
		if (this.size) {
			const now = Date.now();
			const execute: Promise<TaskEntity>[] = [];
			for (const task of this.values()) {
				if (task.time! > now) continue;
				execute.push(task.run());
			}

			if (!execute.length) {
				this._checkInterval();
				return;
			}
			await Promise.all(execute);
		}
		this._checkInterval();
	}

	private async _insert(task: TaskEntity): Promise<TaskEntity | null> {
		if (!task.catchUp && task.time! < Date.now()) {
			if (!task.cron) {
				await task.delete();
				return null;
			}
			await task.edit({ time: task.cron });
		}

		super.set(task.id!, task);
		this._checkInterval();
		return task;
	}

	private _clearInterval(): void {
		if (!isNullish(this.#interval)) {
			TimerManager.clearInterval(this.#interval);
			this.#interval = null;
		}
	}

	private _checkInterval(): void {
		if (!this.size) this._clearInterval();
		else if (!this.#interval) this.#interval = TimerManager.setInterval(this.execute.bind(this), 30000);
	}

	public static get [Symbol.species](): typeof Cache {
		return Cache;
	}

}
