import { Users } from '@lib/orm/entities/Users';
import { EntityRepository } from 'typeorm';
import { BaseRepository } from '@orm/repositories/BaseRepository';

@EntityRepository(Users)
export class UserRepository extends BaseRepository<Users> {

	public findById(id: string): Promise<Users | undefined> {
		return this.findOne({ id });
	}

	public createAndSave(id: string): Promise<Users> {
		return this.save(this.create({ id }));
	}

}
