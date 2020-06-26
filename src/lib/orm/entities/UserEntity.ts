import { BaseEntity, Column, Entity, Index } from 'typeorm';
import { RequestHandler } from '@klasa/request-handler';

@Index('user_pkey', ['id'], { unique: true })
@Entity('user', { schema: 'public' })
export class UserEntity extends BaseEntity {
	@Column('varchar', { primary: true, length: 19 })
	public id: string = null!;

	@Column('int')
	public commandUses = 0;

	private static createHandler = new RequestHandler(
		UserEntity.createOne.bind(UserEntity),
		UserEntity.createMany.bind(UserEntity)
	);

	public static async acquire(id: string): Promise<UserEntity> {
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
}