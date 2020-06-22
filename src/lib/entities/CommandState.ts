import { Column } from 'typeorm';
import type { DefaultJSON } from '@lib/types/types';

export class CommandState {

	@Column({ 'nullable': false, 'default': 0 })
	public count!: number;

	@Column()
	public last!: string;

	public init(): this {
		this.count = 0;
		this.last = '';
		return this;
	}

	public update(command: string): void {
		this.count++;
		this.last = command;
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
