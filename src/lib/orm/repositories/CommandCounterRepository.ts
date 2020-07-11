import { CommandCounterEntity } from '@orm/entities/CommandCounterEntity';
import { BaseRepository } from '@orm/repositories/base/BaseRepository';
import type { Command } from 'klasa';
import { EntityRepository } from 'typeorm';

export type CommandEntityResolvable = string | Command;

@EntityRepository(CommandCounterEntity)
export class CommandCounterRepository extends BaseRepository<CommandCounterEntity, CommandEntityResolvable> {

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
