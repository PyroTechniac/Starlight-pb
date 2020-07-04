import { Column, Entity, Index } from 'typeorm';

@Index('member_guild_user_idx', ['guildID', 'userID'], { unique: true })
@Entity({ schema: 'public' })
export class MemberEntity {

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

}
