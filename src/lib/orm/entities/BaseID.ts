import { Column } from 'typeorm'
import type { DefaultJSON } from '@lib/types/types';

export abstract class BaseID {
	@Column('varchar', { unique: true, primary: true, length: 19 })
	public id!: string;

	public toString(): string {
		return this.id;
	}

	public toJSON(): DefaultJSON {
		return {
			id: this.id
		}
	}
}