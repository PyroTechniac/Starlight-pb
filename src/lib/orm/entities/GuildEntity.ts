import { BaseEntity, Entity, Column, Index } from 'typeorm';
import { RequestHandler } from '@klasa/request-handler';
import { Guild, Role, GuildMember, Message } from '@klasa/core';
import { toss } from '@utils/util';

export type GuildEntityResolvable = Guild | Role | GuildMember | Message | string;

@Entity('guild', { schema: 'public' })
export class GuildEntity extends BaseEntity {

	@Index('guild_pkey', { unique: true })
	@Column('varchar', { primary: true, length: 19 })
	public id: string = null!;

	@Column('int')
	public commandUses = 0;

	@Column('simple-array')
	public userBlacklist: string[] = [];

	@Column('simple-array')
	public guildBlacklist: string[] = [];

	private static createHandler = new RequestHandler(
		GuildEntity.createOne.bind(GuildEntity),
		GuildEntity.createMany.bind(GuildEntity)
	);

	public static async acquire(raw: GuildEntityResolvable): Promise<GuildEntity> {
		const id = this.resolveToID(raw);
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
		});
	}

	private static resolveToID(resolvable: GuildEntityResolvable): string {
		if (resolvable instanceof Role || resolvable instanceof GuildMember) return resolvable.guild.id;
		if (resolvable instanceof Message) return resolvable.guild?.id ?? toss(new Error('Cannot acquire GuildEntity from a DM message'));
		if (resolvable instanceof Guild) return resolvable.id;
		return resolvable;
	}

}
