import { Command, CommandStore, KlasaClient } from 'klasa';

export class MockDecoratorMessage {
	public content: string;
	public guild: MockDecoratorGuild | null;
	private permission: number;

	public constructor(content: string, guild: MockDecoratorGuild | null, permission: number) {
		this.content = content;
		this.guild = guild;
		this.permission = permission;
	}

	public hasAtLeastPermissionLevel(level: number): boolean {
		return this.permission >= level;
	}
}

export class MockDecoratorGuild {
	public name: string;

	public constructor(name: string) {
		this.name = name;
	}
}

export class MockDecoratorCommand extends Command {
	public constructor(store: CommandStore, directory: string, files: readonly string[]) {
		super(store, directory, files);
	}
}

export class MockDecoratorCommandStore extends CommandStore {
	public constructor(prop: string, client?: KlasaClient) {
		super(client!);
	}
}
