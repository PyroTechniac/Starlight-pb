import { BaseID } from '@orm/entities/base/BaseID';
import { Column, Entity, Index } from 'typeorm';

@Entity({ schema: 'public' })
export class GuildEntity extends BaseID {

	@Index('guild_pkey', { unique: true })
	@Column('varchar', { primary: true, length: 19 })
	public id: string = null!;

	@Column('int')
	public commandUses = 0;

}
