import { Cron } from '@klasa/cron';
import type { TaskManager } from '@lib/structures/TaskManager';
import { StarlightEvents } from '@lib/types/enums';
import { BaseID } from '@orm/entities/base/BaseID';
import { isNullish } from '@utils/util';
import type { KlasaClient, Task } from 'klasa';
import { Column, Entity, PrimaryGeneratedColumn, ValueTransformer } from 'typeorm';
import { container } from 'tsyringe';
import { StarlightClient } from '@client/StarlightClient';

export const enum ResponseType {
	Ignore,
	Delay,
	Update,
	Finished
}

export type PartialResponseValue = { type: ResponseType.Ignore | ResponseType.Finished }
	| { type: ResponseType.Delay; value: number }
	| { type: ResponseType.Update; value: Date };

export type ResponseValue = PartialResponseValue & { entry: TaskEntity };

@Entity({ schema: 'public' })
export class TaskEntity extends BaseID<number> {

	@PrimaryGeneratedColumn({ type: 'integer' })
	public id!: number;

	@Column('varchar')
	public taskID!: string;

	@Column('timestamp without time zone')
	public time!: Date;

	@Column('varchar', { nullable: true, transformer: TaskEntity.cronTransformer })
	public recurring: Cron | null = null;

	@Column('boolean')
	public catchUp = true;

	@Column('jsonb')
	public data!: Record<string, unknown>;

	/* eslint-disable @typescript-eslint/explicit-member-accessibility */
	#running = false;

	#paused = true;

	#client: KlasaClient;

	#manager: TaskManager;
	/* eslint-enable @typescript-eslint/explicit-member-accessibility */

	public constructor() {
		super();
		const client = container.resolve(StarlightClient);
		this.#client = client;
		this.#manager = client.manager.tasks;
	}

	public get task(): Task | null {
		return this.#client.tasks.get(this.taskID) ?? null;
	}

	public async run(): Promise<ResponseValue> {
		const { task } = this;
		if (!task?.enabled || this.#running || this.#paused) return { entry: this, type: ResponseType.Ignore };

		this.#running = true;
		let response: PartialResponseValue | null = null;
		try {
			response = await task.run({ ...this.data ?? {}, id: this.id.toString() }) as unknown as PartialResponseValue | null;
		} catch (error) {
			this.#client.emit(StarlightEvents.TaskError, error);
		}

		this.#running = false;

		if (!isNullish(response)) return { ...response, entry: this };

		return isNullish(this.recurring)
			? { entry: this, type: ResponseType.Finished }
			: { entry: this, type: ResponseType.Update, value: this.recurring.next() };
	}

	public resume(): this {
		this.#paused = false;
		return this;
	}

	public pause(): this {
		this.#paused = true;
		return this;
	}

	public delete(): Promise<boolean> {
		return this.#manager.remove(this);
	}

	private static cronTransformer: ValueTransformer = {
		from(value: string | null): Cron | null { return isNullish(value) ? null : new Cron(value); },
		to(value: Cron | null): string | null { return isNullish(value) ? null : value.cron; }
	};

}
