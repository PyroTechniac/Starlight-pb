import { EntityRepository } from 'typeorm';
import { UserEntity } from '../entities/UserEntity';
import { BaseRepository } from './BaseRepository';

@EntityRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity> {

	public createAndSave(id: string): Promise<UserEntity> {
		const user = new UserEntity();
		user.id = id;
		return this.manager.save(user);
	}

	public findByID(id: string): Promise<UserEntity | undefined> {
		return this.findOne({ id });
	}

}
