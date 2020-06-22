import { RequestHandler } from '@klasa/request-handler';
import { UserEntity } from '@lib/entities/UserEntity';
import type { Requestable } from '@lib/types/interfaces';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> implements Requestable<string, UserEntity> {

	public requestHandler = new RequestHandler<string, UserEntity>(this.request.bind(this), this.requestMany.bind(this));

	public createHandler = new RequestHandler<string, UserEntity>(this.createAndSave.bind(this), this.createAndSaveMany.bind(this));

	public request(id: string): Promise<UserEntity> {
		return this.findOneOrFail({ id });
	}

	public async requestMany(ids: string[]): Promise<UserEntity[]> {
		const entities = await this.findByIds(ids);
		if (entities.length !== ids.length) throw new Error('Failed to find entities');
		return entities;
	}

	public async acquire(id: string): Promise<UserEntity> {
		try {
			return await this.requestHandler.push(id);
		} catch {
			return this.createHandler.push(id);
		}
	}

	public createAndSave(id: string): Promise<UserEntity> {
		const user = new UserEntity().init(id);
		return this.manager.save(user);
	}

	public createAndSaveMany(ids: string[]): Promise<UserEntity[]> {
		const users = ids.map((id): UserEntity => new UserEntity().init(id));
		return this.manager.save(users);
	}

}
