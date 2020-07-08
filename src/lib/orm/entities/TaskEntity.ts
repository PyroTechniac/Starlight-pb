import type { Client } from '@klasa/core';
import { Cron } from '@klasa/cron';
import type { TaskManager } from '@lib/structures/TaskManager';
import type { TaskEntityEditOptions } from '@lib/types/types';
import { BaseID } from '@orm/entities/base/BaseID';
import { isNullish } from '@utils/util';
import type { Task, TimeResolvable } from 'klasa';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'public' })
export class TaskEntity extends BaseID {

	/* eslint-disable @typescript-eslint/explicit-member-accessibility */
	#client: Client = null!;

	#manager: TaskManager = null!;

	#task: Task | null = null;

	#running = false;
	/* eslint-enable @typescript-eslint/explicit-member-accessibility */

	@PrimaryGeneratedColumn('uuid')
	public id!: string;

	@Column('varchar', { length: 32 })
	public taskName?: string;

	@Column('varchar', { nullable: true })
	public recurring?: string | null;

	@Column('int')
	public time?: number;

	@Column('boolean')
	public catchUp?: boolean;

	@Column('simple-json')
	public data?: Record<PropertyKey, any>;

	public constructor(data: Partial<TaskEntity> = {}) {
		super();
		Object.assign(this, data);
	}

	public get runTime(): Date {
		return new Date(this.time!);
	}

	public set runTime(value: Date) {
		this.time = value.getTime();
	}

	public get cron(): Cron | null {
		return isNullish(this.recurring) ? null : new Cron(this.recurring);
	}

	public set cron(value: Cron | null) {
		this.recurring = value?.cron ?? null;
	}

	public clone(): this {
		return super.clone().setup(this.#manager);
	}

	public setup(manager: TaskManager): this {
		this.#client = manager.client;
		this.#manager = manager;
		this.#task = this.#client.tasks.get(this.taskName!) ?? null;
		return this;
	}

	public setTime(time: TimeResolvable): this {
		const [date, recurring] = TaskEntity._resolveTime(time);
		this.time = date.getTime();
		this.cron = recurring;
		return this;
	}

	public setTaskName(taskName: string): this {
		this.taskName = taskName;
		this.#task = this.#client.tasks.get(taskName) ?? null;
		return this;
	}

	public setData(data: Record<PropertyKey, unknown>): this {
		this.data = data;
		return this;
	}

	public setCatchUp(value: boolean): this {
		this.catchUp = value;
		return this;
	}

	public async run(): Promise<this> {
		const task = this.#task;
		if (isNullish(task) || !task.enabled || this.#running) return this;

		this.#running = true;

		try {
			await task.run({ ...this.data ?? {}, id: this.id.toString() });
		} catch (error) {
			this.#client.emit('taskError', this, task, error);
		}
		this.#running = false;

		if (isNullish(this.cron)) await this.delete();
		else await this.edit({ time: this.cron });
		return this;
	}

	public async edit(data: TaskEntityEditOptions = {}): Promise<this> {
		const clone = this.clone();
		if (!isNullish(data.time)) {
			const [_time, _cron] = TaskEntity._resolveTime(data.time);
			this.runTime = _time;
			this.cron = _cron;
		}

		if (!isNullish(data.data)) this.data = data.data;
		if (!isNullish(data.catchUp)) this.catchUp = data.catchUp;

		try {
			await this.save();
		} catch (error) {
			Object.assign(this, clone);
			throw error;
		}

		return this;
	}

	public delete(): Promise<TaskEntity> {
		this.#manager.delete(this.id);
		return this.remove();
	}

	private static _resolveTime(time: TimeResolvable): [Date, Cron | null] {
		if (time instanceof Date) return [time, null];
		if (time instanceof Cron) return [time.next(), time];
		if (typeof time === 'number') return [new Date(time), null];
		if (typeof time === 'string') {
			const cron = new Cron(time);
			return [cron.next(), cron];
		}

		throw new Error('Invalid time provided.');
	}

}

export interface ScheduledTaskOptions {
	catchUp?: boolean;
	data?: Record<PropertyKey, unknown>;
}
