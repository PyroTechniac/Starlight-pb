import { Repository, EntityRepository } from 'typeorm';
import { CommandCounterEntity } from '@orm/entities/CommandCounterEntity';
import type { BaseRepository } from '@lib/types/interfaces';
import type { Command } from 'klasa';
import { RequestHandler } from '@klasa/request-handler';

export type CommandEntityResolvable = string | Command;

@EntityRepository(CommandCounterEntity)
export class CommandCounterRepository extends Repository<CommandCounterEntity> implements BaseRepository<string, CommandCounterEntity, CommandEntityResolvable> {

	public createHandler = new RequestHandler(
		this.createOne.bind(this),
		this.createMany.bind(this)
	);

	public async acquire(resolvable: CommandEntityResolvable): Promise<CommandCounterEntity> {
		const id = this.resolveToID(resolvable);
		try {
			return await this.findOneOrFail({ id });
		} catch {
			return this.createHandler.push(id);
		}
	}

	public createOne(id: string): Promise<CommandCounterEntity> {
		const entity = new CommandCounterEntity();
		entity.id = id;
		return this.save(entity);
	}

	public createMany(ids: readonly string[]): Promise<CommandCounterEntity[]> {
		return this.manager.transaction((manager): Promise<CommandCounterEntity[]> => {
			const entities = [];
			for (const id of ids) {
				const entity = new CommandCounterEntity();
				entity.id = id;
				entities.push(entity);
			}
			return manager.save(entities);
		});
	}

	public resolveToID(resolvable: CommandEntityResolvable): string {
		return typeof resolvable === 'string' ? resolvable : resolvable.name;
	}

}
