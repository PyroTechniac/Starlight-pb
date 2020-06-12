import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('users')
export class UserEntity {

	@PrimaryColumn({ type: 'bigint', unique: true })
	public id!: string;

	@Column({ 'nullable': false, 'default': 0 })
	public commandUses!: number;

}
