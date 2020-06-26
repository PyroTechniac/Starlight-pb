import { BaseEntity, Entity, Column, Index } from "typeorm";
import { RequestHandler } from "@klasa/request-handler";

@Index('member_guild_user_idx', ['guildID', 'userID'], { unique: true })
@Entity('member', { schema: 'public' })
export class MemberEntity extends BaseEntity {
	@Column('varchar', { primary: true, length: 19 })
	public guildID: string = null!;

	@Column('varchar', { primary: true, length: 19 })
	public userID: string = null!;

	@Column('int')
	public commandUses = 0;

	public get id(): string {
		return `${this.guildID}.${this.userID}`;
	}

	public set id(value: string) {
		const [guildID, userID] = value.split('.', 2);
		this.guildID = guildID;
		this.userID = userID;
	}

	private static createHandler = new RequestHandler(
		MemberEntity.createOne.bind(MemberEntity),
		MemberEntity.createMany.bind(MemberEntity)
	)

	public static async acquire(guildID: string, userID: string): Promise<MemberEntity> {
		try {
			return await this.findOneOrFail({ guildID, userID });
		} catch {
			return this.createHandler.push(`${guildID}.${userID}`);
		}
	}

	private static createOne(id: string): Promise<MemberEntity> {
		const entity = new MemberEntity();
		entity.id = id;
		return this.save(entity);
	}

	private static createMany(ids: readonly string[]): Promise<MemberEntity[]> {
		return this.getRepository().manager.transaction((manager): Promise<MemberEntity[]> => {
			const entities = [];
			for (const id of ids) {
				const entity = new MemberEntity();
				entity.id = id;
				entities.push(entity);
			}

			return manager.save(entities);
		})
	}
}