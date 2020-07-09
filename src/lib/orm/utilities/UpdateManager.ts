import { AsyncQueue } from '@klasa/async-queue';
import type { BaseID } from '@orm/entities/base/BaseID';
import { isNullish } from '@utils/util';

export class UpdateManager<T extends BaseID> {

	/* eslint-disable @typescript-eslint/explicit-member-accessibility */
	#queue: ((entity: T) => void | Promise<void>)[] = [];

	#entity: T;

	#manager = new AsyncQueue();
	/* eslint-enable @typescript-eslint/explicit-member-accessibility */

	public constructor(entity: T) {
		this.#entity = entity;
	}

	public add(cb: (entity: T) => void): Promise<void> {
		this.#queue.push(cb);
		return this.run();
	}

	public async run(): Promise<void> {
		for await (const __ of this) { // eslint-disable-line @typescript-eslint/no-unused-vars
			// noop
		}

		await this.#entity.save();
	}

	public async *[Symbol.asyncIterator](): AsyncIterableIterator<void> {
		const next = this.#queue.shift() ?? ((): null => null);
		const entity = this.#entity;
		const clone = entity.clone();
		await this.#manager.wait();
		try {
			await next(clone);
			this.#entity = clone;
		} catch (error) {
			this.#entity = entity;
			throw error;
		} finally {
			this.#manager.shift();
		}

		if (this.#queue.length !== 0) yield *this;
	}

	private static managers = new Map<string, UpdateManager<BaseID>>();

	public static acquire<T extends BaseID>(base: T): UpdateManager<T> {
		const existing = this.managers.get(base.id);
		// @ts-ignore idk
		if (!isNullish(existing)) return existing;
		const manager = new UpdateManager(base);
		// @ts-ignore idk
		this.managers.set(base.id, manager as unknown as UpdateManager<T>);
		return manager;
	}

}
