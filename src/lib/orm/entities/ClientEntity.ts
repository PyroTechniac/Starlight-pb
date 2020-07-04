import { Column, Entity, Index } from 'typeorm';

@Entity('client', { schema: 'public' })
export class ClientEntity {

	@Index('client_storage_pkey', { unique: true })
	@Column('varchar', { primary: true, length: 19 })
	public id: string = null!;

	@Column('int')
	public commandUses = 0;

}
