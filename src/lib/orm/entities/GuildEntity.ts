import { BaseEntity, Entity, Column, Index } from "typeorm";
import { RequestHandler } from "@klasa/request-handler";

@Index('guild_pkey', ['id'], { unique: true })
@Entity('guild', { schema: 'public' })
export class GuildEntity extends BaseEntity {
	@Column('varchar', { primary: true, length: 19 })
	public id: string = null!;

	@Column('int')
	public commandUses = 0;

	private static createHandler = new RequestHandler(
		GuildEntity.createOne.bind(GuildEntity),
		GuildEntity.createMany.bind(GuildEntity)
	)

	public static async acquire(id: string) {
		try {
			return await this.findOneOrFail({ id });
		} catch {
			return this.createHandler.push(id);
		}
	}

	private static createOne(id: string): Promise<GuildEntity> {
		const entity = new GuildEntity();
		entity.id = id;
		return this.save(entity);
	}

	private static createMany(ids: readonly string[]): Promise<GuildEntity[]> {
		return this.getRepository().manager.transaction((manager): Promise<GuildEntity[]> => {
			const entities = [];
			for (const id of ids) {
				const entity = new GuildEntity();
				entity.id = id;
				entities.push(entity);
			}
			return manager.save(entities);
		})
	}
}