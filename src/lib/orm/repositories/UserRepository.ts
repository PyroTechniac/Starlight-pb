import { GuildMember, Message, User } from '@klasa/core';
import { UserEntity } from '@orm/entities/UserEntity';
import { BaseRepository } from '@orm/repositories/base/BaseRepository';
import { toss } from '@utils/util';
import { EntityRepository } from 'typeorm';

export type UserEntityResolvable = User | Message | GuildMember | string;

@EntityRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity, UserEntityResolvable> {

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
