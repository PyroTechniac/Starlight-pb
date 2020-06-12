import { UserEntity } from '../entities/UserEntity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {

	public async acquire(id: string): Promise<UserEntity> {
		return (await this.findByID(id)) ?? this.createAndSave(id);
	}

	public createAndSave(id: string): Promise<UserEntity> {
		const user = new UserEntity();
		user.id = id;
		return this.manager.save(user);
	}

	public findByID(id: string): Promise<UserEntity | undefined> {
		return this.findOne({ id });
	}

}
