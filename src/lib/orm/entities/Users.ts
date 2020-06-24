import { Entity, Column } from 'typeorm';
import { CommandState } from '@orm/entities/CommandState';
import type { DefaultJSON } from '@lib/types/types';
import { BaseID } from '@orm/entities/BaseID';

@Entity('users')
export class Users extends BaseID {

	@Column((): typeof CommandState => CommandState)
	public commandState: CommandState = new CommandState();

	public set command(command: string) {
		this.commandState.command = command;
	}

	public toJSON(): DefaultJSON {
		return {
			...super.toJSON(),
			command: this.commandState
		};
	}

}
