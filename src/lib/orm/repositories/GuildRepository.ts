import { Guild, GuildMember, Message, Role } from '@klasa/core';
import { GuildEntity } from '@orm/entities/GuildEntity';
import { BaseRepository } from '@orm/repositories/base/BaseRepository';
import { toss } from '@utils/util';
import { EntityRepository } from 'typeorm';

export type GuildEntityResolvable = Guild | Role | GuildMember | Message | string;

@EntityRepository(GuildEntity)
export class GuildRepository extends BaseRepository<GuildEntity, GuildEntityResolvable> {

	public createOne(id: string): Promise<GuildEntity> {
		const entity = new GuildEntity();
		entity.id = id;
		return this.save(entity);
	}

	public createMany(ids: readonly string[]): Promise<GuildEntity[]> {
		return this.manager.transaction((manager): Promise<GuildEntity[]> => {
			const entities = [];
			for (const id of ids) {
				const entity = new GuildEntity();
				entity.id = id;
				entities.push(entity);
			}
			return manager.save(entities);
		});
	}

	public resolveToID(resolvable: GuildEntityResolvable): string {
		if (resolvable instanceof Role || resolvable instanceof GuildMember) return resolvable.guild.id;
		if (resolvable instanceof Message) return resolvable.guild?.id ?? toss(new Error('Cannot acquire GuildEntity from a DM message'));
		if (resolvable instanceof Guild) return resolvable.id;
		return resolvable;
	}

}
