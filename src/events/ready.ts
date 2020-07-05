import { Event, EventOptions } from '@klasa/core';
import { DbManager } from '@orm/DbManager';
import type { CommandCounterEntity } from '@orm/entities/CommandCounterEntity';
import type { GuildEntity } from '@orm/entities/GuildEntity';
import { mergeOptions } from '@utils/decorators';

@mergeOptions<EventOptions>({
	once: true
})
export default class extends Event {

	private commands: CommandCounterEntity[] = [];

	private guilds: GuildEntity[] = [];

	public async run(): Promise<void> {
		const manager = await DbManager.connect();
		await this.initCommands(manager);
		await this.initGuilds(manager);
		await this.client.manager.tasks.init();
	}

	public async init(): Promise<void> {
		const { guilds, commandCounters } = await DbManager.connect();
		this.guilds.push(...await guilds.find());
		this.commands.push(...await commandCounters.find());
	}

	private async initCommands({ commandCounters }: DbManager): Promise<void> {
		await Promise.all(
			this.client.commands
				.filter((command): boolean => !this.commands.some((entry): boolean => entry.id === command.name))
				.map(commandCounters.acquire.bind(commandCounters))
		);
	}

	private async initGuilds({ guilds }: DbManager): Promise<void> {
		await Promise.all(
			this.client.guilds
				.filter((guild): boolean => !this.guilds.some((entry): boolean => entry.id === guild.id))
				.map(guilds.acquire.bind(guilds))
		);
	}

}
