import { BaseEntity, Column, Entity, Index } from 'typeorm';
import { RequestHandler } from '@klasa/request-handler';
import { User, Message, GuildMember } from '@klasa/core';
import { toss } from '@utils/util';

export type UserEntityResolvable = User | Message | GuildMember | string;

@Entity('user', { schema: 'public' })
export class UserEntity extends BaseEntity {
	@Index('user_idx', { unique: true })
	@Column('varchar', { primary: true, length: 19 })
	public id: string = null!;

	@Column('int')
	public commandUses = 0;

	private static createHandler = new RequestHandler(
		UserEntity.createOne.bind(UserEntity),
		UserEntity.createMany.bind(UserEntity)
	);

	public static async acquire(raw: UserEntityResolvable): Promise<UserEntity> {
		const id = this.resolveToID(raw);
		try {
			return await this.findOneOrFail({ id });
		} catch {
			return this.createHandler.push(id);
		}
	}

	private static createOne(id: string): Promise<UserEntity> {
		const entity = new UserEntity();
		entity.id = id;
		return this.save(entity);
	}

	private static createMany(ids: readonly string[]): Promise<UserEntity[]> {
		return this.getRepository().manager.transaction((manager): Promise<UserEntity[]> => {
			const entities = [];
			for (const id of ids) {
				const entity = new UserEntity();
				entity.id = id;
				entities.push(entity);
			}

			return manager.save(entities);
		})
	}

	private static resolveToID(resolvable: UserEntityResolvable): string {
		if (resolvable instanceof Message) return resolvable.author.id;
		if (resolvable instanceof GuildMember) return resolvable.user?.id ?? toss(new Error('User is not cached from GuildMember instance'));
		if (resolvable instanceof User) return resolvable.id;
		return resolvable;
	}
}
