import { AsyncQueue } from '@klasa/async-queue';
import type { BaseID } from "@orm/entities/base/BaseID";
import { isNullish } from '@utils/util';

export class UpdateManager<T extends BaseID> {
	#queue: ((entity: T) => void)[] = [];

	#entity: T;

	#manager = new AsyncQueue();

	public constructor(entity: T) {
		this.#entity = entity;
	}

	public add(cb: (entity: T) => void) {
		this.#queue.push(cb);
		return this.finish();
	}

	public async finish(): Promise<T> {
		for await (const __ of this.run()) {
			// noop
		}
		return this.#entity.save();
	}

	private async *run(): AsyncIterableIterator<void> {
		const next = this.#queue.shift() ?? ((): null => null);
		await this.#manager.wait();
		try {
			next(this.#entity);
		} finally {
			this.#manager.shift();
		}

		if (this.#queue.length !== 0) yield* this.run();
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
