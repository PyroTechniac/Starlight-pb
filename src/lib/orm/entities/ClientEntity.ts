import { Column, Entity, Index } from 'typeorm';
import { RebootState } from '@orm/entities/RebootState';

@Entity('client', { schema: 'public' })
export class ClientEntity {

	@Index('client_storage_pkey', { unique: true })
	@Column('varchar', { primary: true, length: 19 })
	public id: string = null!;

	@Column('int')
	public commandUses = 0;

	@Column((): typeof RebootState => RebootState, { prefix: false })
	public rebootState: RebootState = new RebootState();

}
