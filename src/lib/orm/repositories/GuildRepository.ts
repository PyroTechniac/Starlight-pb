import { EntityRepository, Repository } from 'typeorm';
import { GuildEntity } from '@orm/entities/GuildEntity';
import type { BaseRepository } from '@lib/types/interfaces';
import { Guild, Role, GuildMember, Message } from '@klasa/core';
import { toss } from '@utils/util';
import { RequestHandler } from '@klasa/request-handler';

export type GuildEntityResolvable = Guild | Role | GuildMember | Message | string;

@EntityRepository(GuildEntity)
export class GuildRepository extends Repository<GuildEntity> implements BaseRepository<string, GuildEntity, GuildEntityResolvable> {

	public createHandler = new RequestHandler(
		this.createOne.bind(this),
		this.createMany.bind(this)
	);

	public async acquire(resolvable: GuildEntityResolvable): Promise<GuildEntity> {
		const id = this.resolveToID(resolvable);
		try {
			return await this.findOneOrFail({ id });
		} catch {
			return this.createHandler.push(id);
		}
	}

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
