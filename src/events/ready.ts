import { Event, EventOptions } from '@klasa/core';
import { CommandCounterEntity } from '@orm/entities/CommandCounterEntity';
import { mergeOptions } from '@utils/decorators';
import { DbManager } from '@orm/DbManager';
import { GuildEntity } from '@orm/entities/GuildEntity';

@mergeOptions<EventOptions>({
	once: true
})
export default class extends Event {

	private entities = new Map<'guilds' | 'commands', (GuildEntity | CommandCounterEntity)[]>();

	public async run(): Promise<void> {
		await DbManager.connect();
		await this.initCommands();
		await this.initGuilds();
	}

	public async init(): Promise<void> {
		const connection = await DbManager.connect();
		const [guildEntities, commandEntities] = await connection.transaction(async (manager): Promise<[GuildEntity[], CommandCounterEntity[]]> => {
			const guildRepo = manager.getRepository(GuildEntity);
			const commandRepo = manager.getRepository(CommandCounterEntity);
			return Promise.all([guildRepo.find(), commandRepo.find()]);
		});

		this.entities
			.set('guilds', guildEntities)
			.set('commands', commandEntities);
	}

	private getEntities(entityName: 'commands'): CommandCounterEntity[];
	private getEntities(entityName: 'guilds'): GuildEntity[];
	private getEntities(entityName: 'commands' | 'guilds'): (GuildEntity | CommandCounterEntity)[] {
		return this.entities.get(entityName)!;
	}

	private initCommands(): Promise<CommandCounterEntity[]> {
		const existing = this.getEntities('commands');
		return Promise.all(
			this.client.commands
				.filter((command): boolean => !existing.some((entry): boolean => entry.id === command.name))
				.map(CommandCounterEntity.acquire.bind(CommandCounterEntity))
		);
	}

	private initGuilds(): Promise<GuildEntity[]> {
		const existing = this.getEntities('guilds');
		return Promise.all(
			this.client.guilds
				.filter((guild): boolean => !existing.some((entry): boolean => entry.id === guild.id))
				.map(GuildEntity.acquire.bind(GuildEntity))
		);
	}

}
