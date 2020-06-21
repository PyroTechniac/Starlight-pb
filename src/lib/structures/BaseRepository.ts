import { Repository, ObjectLiteral } from 'typeorm';

export abstract class BaseRepository<Entity extends ObjectLiteral> extends Repository<Entity> {

	public async acquire(id: string): Promise<Entity> {
		return (await this.findByID(id)) ?? this.createAndSave(id);
	}

	public abstract createAndSave(id: string): Promise<Entity>;

	public abstract findByID(id: string): Promise<Entity | undefined | null>;

}
