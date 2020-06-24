import { Column } from 'typeorm';
import type { DefaultJSON } from '@lib/types/types';

export class CommandState {

	@Column('integer')
	public count: number = 0;

	@Column('varchar', { nullable: true })
	public last: string | null = null;

	public set command(name: string) {
		this.count++;
		this.last = name;
	}

	public valueOf(): number {
		return this.count;
	}

	public toJSON(): DefaultJSON {
		return {
			lastUsed: this.last,
			count: this.count
		};
	}

}
