import { BaseID } from '@orm/entities/base/BaseID';
import { Column, Entity, Index } from 'typeorm';

@Entity({ schema: 'public' })
export class UserEntity extends BaseID {

	@Index('user_idx', { unique: true })
	@Column('varchar', { primary: true, length: 19 })
	public id: string = null!;

	@Column('int')
	public commandUses = 0;

}
