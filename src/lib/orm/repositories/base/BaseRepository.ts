import type { BaseID } from '@orm/entities/base/BaseID';
import { Repository } from 'typeorm';
import { AsyncQueue } from '@klasa/async-queue';
import { isNullish } from '@utils/util';
import { TimerManager } from '@klasa/timer-manager';
import { Cache } from '@klasa/cache';
import { RequestHandler } from '@klasa/request-handler';

export abstract class BaseRepository<V extends BaseID, Rs> extends Repository<V> {

	/* eslint-disable @typescript-eslint/explicit-member-accessibility */
	#createHandler = new RequestHandler(
		this.createOne.bind(this),
		this.createMany.bind(this)
	);

	#findHandler = new RequestHandler(
		this.requestOne.bind(this),
		this.requestMany.bind(this)
	);
	/* eslint-enable @typescript-eslint/explicit-member-accessibility */

	public async acquire(resolvable: Rs): Promise<V> {
		const id = this.resolveToID(resolvable);
		try {
			return await this.#findHandler.push(id);
		} catch {
			return this.#createHandler.push(id);
		}
	}

	public async lock<T>(resolvables: readonly Rs[], callback: (...target: readonly V['id'][]) => Promise<T>): Promise<T> {
		const targets = resolvables.map(this.resolveToID.bind(this));
		if (targets.length !== new Set(targets).size) throw new Error(`Duplicated targets: ${targets.join('\', \'')}`);

		const queues = targets.map((target): AsyncQueue => {
			const existing = BaseRepository.queues.get(target);
			if (!isNullish(existing)) return existing;

			const created = new AsyncQueue();
			BaseRepository.queues.set(target, created);
			return created;
		});

		await Promise.all(queues.map((queue): Promise<void> => queue.wait()));

		try {
			return await callback(...targets);
		} finally {
			for (const queue of queues) queue.shift();
		}
	}

	public requestOne(id: V['id']): Promise<V> {
		return this.findOneOrFail(id);
	}

	public async requestMany(ids: readonly V['id'][]): Promise<V[]> {
		const found = await this.findByIds([...ids]);
		if (found.length !== ids.length) throw new Error('Failed to find equal');
		return found;
	}

	public abstract createOne(id: V['id']): Promise<V>;

	public abstract createMany(ids: readonly V['id'][]): Promise<V[]>;

	public abstract resolveToID(resolvable: Rs): V['id'];

	private static queues = new Cache<string, AsyncQueue>();

}

TimerManager.setInterval((): void => {
	BaseRepository['queues'].sweep((value): boolean => value.remaining === 0);
}, 60000);
