import { Entity, PrimaryColumn, Column } from 'typeorm';
import { CommandState } from '@lib/entities/CommandState';
import type { DefaultJSON } from '@lib/types/types';

@Entity('users')
export class UserEntity {

	@PrimaryColumn({ unique: true })
	public id!: string;

	@Column((): typeof CommandState => CommandState)
	public commandState!: CommandState;

	public set command(command: string) {
		this.commandState.update(command);
	}

	public init(id: string): this {
		this.id = id;
		this.commandState = new CommandState();
		this.commandState.init();
		return this;
	}

	public toJSON(): DefaultJSON {
		return {
			id: this.id,
			command: this.commandState
		};
	}

}
