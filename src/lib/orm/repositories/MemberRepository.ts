import { Repository, EntityRepository } from 'typeorm';
import { MemberEntity } from '@orm/entities/MemberEntity';
import { GuildMember, Message } from '@klasa/core';
import { toss } from '@utils/util';
import { RequestHandler } from '@klasa/request-handler';

@EntityRepository(MemberEntity)
export class MemberRepository extends Repository<MemberEntity> {

	public createHandler= new RequestHandler(
		this.createOne.bind(this),
		this.createMany.bind(this)
	);

	public async acquire(guildIDOrMember: GuildMember | Message | string, rawUserID?: string): Promise<MemberEntity> {
		const [guildID, userID] = this.resolveToID(guildIDOrMember, rawUserID);
		try {
			return await this.findOneOrFail({ guildID, userID });
		} catch {
			return this.createHandler.push(`${guildID}.${userID}`);
		}
	}

	public createOne(id: string): Promise<MemberEntity> {
		const entity = new MemberEntity();
		entity.id = id;
		return this.save(entity);
	}

	public createMany(ids: readonly string[]): Promise<MemberEntity[]> {
		return this.manager.transaction((manager): Promise<MemberEntity[]> => {
			const entities = [];
			for (const id of ids) {
				const entity = new MemberEntity();
				entity.id = id;
				entities.push(entity);
			}
			return manager.save(entities);
		});
	}

	public resolveToID(resolvable: GuildMember | Message | string, userID?: string): [string, string] {
		if (typeof resolvable === 'string') {
			if (typeof userID === 'string') return [resolvable, userID];
			return resolvable.split('.', 2) as [string, string];
		}
		return [
			resolvable.guild?.id ?? toss(new Error('Cannot get MemberEntity in a DM message')),
			resolvable instanceof Message
				? resolvable.author.id
				: resolvable.user?.id ?? toss(new Error('Cannot get MemberEntity of uncached User'))
		];
	}

}
