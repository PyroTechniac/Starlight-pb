import { Entity, BaseEntity, Column, Index } from 'typeorm';
import { RequestHandler } from '@klasa/request-handler';
import type { Command } from 'klasa';

export type CommandEntityResolvable = string | Command;

@Entity('command_counter', { schema: 'public' })
export class CommandCounterEntity extends BaseEntity {

	@Index('command_counter_pkey', { unique: true })
	@Column('varchar', { primary: true, length: 32 })
	public id: string = null!;

	@Column('int')
	public uses = 0;

	public setID(id: string): this {
		this.id = id;
		return this;
	}

	private static createHandler = new RequestHandler(
		CommandCounterEntity.createOne.bind(CommandCounterEntity),
		CommandCounterEntity.createMany.bind(CommandCounterEntity)
	);

	public static async acquire(raw: CommandEntityResolvable): Promise<CommandCounterEntity> {
		const id = this.resolveToID(raw);
		try {
			return await this.findOneOrFail({ id });
		} catch {
			return this.createHandler.push(id);
		}
	}

	private static createOne(id: string): Promise<CommandCounterEntity> {
		const entity = new CommandCounterEntity();
		entity.id = id;
		return this.save(entity);
	}

	private static createMany(ids: readonly string[]): Promise<CommandCounterEntity[]> {
		return this.getRepository().manager.transaction((manager): Promise<CommandCounterEntity[]> => {
			const entities = [];
			for (const id of ids) {
				const entity = new CommandCounterEntity();
				entity.id = id;
				entities.push(entity);
			}
			return manager.save(entities);
		});
	}

	private static resolveToID(resolvable: CommandEntityResolvable): string {
		return typeof resolvable === 'string' ? resolvable : resolvable.name;
	}

}
