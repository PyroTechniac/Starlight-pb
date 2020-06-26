import { BaseEntity, Column, Entity, Index } from 'typeorm';

@Index('user_user_idx', ['id'], { unique: true })
@Entity('user', { schema: 'public' })
export class UserEntity extends BaseEntity {
	@Column('varchar', { primary: true, length: 19 })
	public id?: string;

	public static async acquire(id: string): Promise<UserEntity> {
		try {
			return await this.findOneOrFail({ id });
		} catch {
			const entity = new UserEntity();
			entity.id = id;
			await this.save(entity);
			return entity;
		}
	}
}