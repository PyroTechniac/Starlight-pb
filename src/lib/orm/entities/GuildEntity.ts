import { Column, Entity, Index } from 'typeorm';

@Entity('guild', { schema: 'public' })
export class GuildEntity {

	@Index('guild_pkey', { unique: true })
	@Column('varchar', { primary: true, length: 19 })
	public id: string = null!;

	@Column('int')
	public commandUses = 0;

	@Column('simple-array')
	public userBlacklist: string[] = [];

	@Column('simple-array')
	public guildBlacklist: string[] = [];

}
