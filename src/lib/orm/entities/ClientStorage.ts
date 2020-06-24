import { BaseID } from "@orm/entities/BaseID";
import { Entity, Column } from "typeorm";
import { CommandState } from "./CommandState";
import type { DefaultJSON } from "@lib/types/types";

@Entity('clientStorage')
export class ClientStorage extends BaseID {
	@Column((): typeof CommandState => CommandState, { prefix: false })
	public commandState: CommandState = new CommandState();

	public set command(name: string) {
		this.commandState.command = name;
	}

	public toJSON(): DefaultJSON {
		return {
			...super.toJSON(),
			command: this.commandState
		}
	}
}