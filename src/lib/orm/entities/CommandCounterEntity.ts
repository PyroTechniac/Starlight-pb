import { Column, Entity, Index } from 'typeorm';

@Entity('command_counter', { schema: 'public' })
export class CommandCounterEntity {

	@Index('command_counter_pkey', { unique: true })
	@Column('varchar', { primary: true, length: 32 })
	public id: string = null!;

	@Column('int')
	public uses = 0;

}
