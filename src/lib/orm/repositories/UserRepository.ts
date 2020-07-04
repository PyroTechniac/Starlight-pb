import { Repository, EntityRepository } from 'typeorm';
import { UserEntity } from '@orm/entities/UserEntity';
import { User, Message, GuildMember } from '@klasa/core';
import { toss } from '@utils/util';
import { RequestHandler } from '@klasa/request-handler';
import type { BaseRepository } from '@lib/types/interfaces';

export type UserEntityResolvable = User | Message | GuildMember | string;

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> implements BaseRepository<string, UserEntity, UserEntityResolvable> {

	public createHandler = new RequestHandler(
		this.createOne.bind(this),
		this.createMany.bind(this)
	);

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

	public resolveToID(resolvable: UserEntityResolvable): string {
		if (resolvable instanceof Message) return resolvable.author.id;
		if (resolvable instanceof GuildMember) return resolvable.user?.id ?? toss(new Error('User is not cached from GuildMember'));
		if (resolvable instanceof User) return resolvable.id;
		return resolvable;
	}

}
