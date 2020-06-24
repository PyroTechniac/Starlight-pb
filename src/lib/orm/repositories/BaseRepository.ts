import {Repository, ObjectLiteral} from 'typeorm';

export abstract class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
	public async acquire(id: string) {
		const existing = await this.findById(id);
		return (existing ?? await this.createAndSave(id));
	}

	public abstract findById(id: string): Promise<T | undefined | null>;

	public abstract createAndSave(id: string): Promise<T>;
}