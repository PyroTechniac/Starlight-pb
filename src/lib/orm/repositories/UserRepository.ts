import { AsyncQueue } from '@klasa/async-queue';
import { GuildMember, Message, User } from '@klasa/core';
import { RequestHandler } from '@klasa/request-handler';
import type { BaseRepository } from '@lib/types/interfaces';
import { UserEntity } from '@orm/entities/UserEntity';
import { toss } from '@utils/util';
import { EntityRepository, Repository, SaveOptions } from 'typeorm';

export type UserEntityResolvable = User | Message | GuildMember | string;

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> implements BaseRepository<string, UserEntity, UserEntityResolvable> {

	public createHandler = new RequestHandler(
		this.createOne.bind(this),
		this.createMany.bind(this)
	);

	private queue = new AsyncQueue();

	public async acquire(resolvable: UserEntityResolvable): Promise<UserEntity> {
		const id = this.resolveToID(resolvable);
		try {
			return await this.findOneOrFail({ id });
		} catch {
			return this.createHandler.push(id);
		}
	}

	public createOne(id: string): Promise<UserEntity> {
		const entity = new UserEntity();
		entity.id = id;
		return this.save(entity);
	}

	public createMany(ids: readonly string[]): Promise<UserEntity[]> {
		return this.manager.transaction((manager): Promise<UserEntity[]> => {
			const entities = [];
			for (const id of ids) {
				const entity = new UserEntity();
				entity.id = id;
				entities.push(entity);
			}
			return manager.save(entities);
		});
	}

	public async saveOne(entity: UserEntity, options?: SaveOptions): Promise<UserEntity> {
		await this.queue.wait();
		try {
			return await this.save(entity, options);
		} finally {
			this.queue.shift();
		}
	}

	public resolveToID(resolvable: UserEntityResolvable): string {
		if (resolvable instanceof Message) return resolvable.author.id;
		if (resolvable instanceof GuildMember) return resolvable.user?.id ?? toss(new Error('User is not cached from GuildMember'));
		if (resolvable instanceof User) return resolvable.id;
		return resolvable;
	}

}
