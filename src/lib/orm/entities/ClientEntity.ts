import { BaseID } from '@orm/entities/base/BaseID';
import { Column, Entity, Index } from 'typeorm';

@Entity({ schema: 'public' })
export class ClientEntity extends BaseID {

	@Index('client_storage_pkey', { unique: true })
	@Column('varchar', { primary: true, length: 19 })
	public id: string = null!;

	@Column('int')
	public commandUses = 0;

}
