import { BaseID } from '@orm/entities/base/BaseID';
import { Column, Entity, Index } from 'typeorm';

@Entity({ schema: 'public' })
export class CommandCounterEntity extends BaseID {

	@Index('command_counter_pkey', { unique: true })
	@Column('varchar', { primary: true, length: 32 })
	public id: string = null!;

	@Column('int')
	public uses = 0;

}
