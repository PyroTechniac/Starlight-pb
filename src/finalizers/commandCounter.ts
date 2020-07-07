import { Message } from '@klasa/core';
import { DbManager } from '@orm/DbManager';
import { requiresGuildContext } from '@utils/decorators';
import { Command, Finalizer } from 'klasa';

export default class extends Finalizer {

	public async run(message: Message, command: Command): Promise<void> {
		const connection = await DbManager.connect();
		await this.ensureSettings(message, command, connection);
		const { commandCounters, users, clients } = connection;
		await commandCounters.increment({ id: command.name }, 'uses', 1);
		await users.increment({ id: message.author.id }, 'commandUses', 1);
		await clients.increment({ id: this.client.user!.id }, 'commandUses', 1);
		await this.handleGuildMessage(message, connection);
	}

	@requiresGuildContext()
	private async handleGuildMessage(message: Message, manager: DbManager): Promise<void> {
		const { guilds, members } = manager;
		await members.acquire(message);
		await guilds.acquire(message);
		await guilds.increment({ id: message.guild!.id }, 'commandUses', 1);
		await members.increment({ guildID: message.guild!.id, userID: message.author.id }, 'commandUses', 1);
	}

	private async ensureSettings(message: Message, command: Command, { users, clients, commandCounters }: DbManager): Promise<void> {
		await users.acquire(message);
		await clients.acquire(message);
		await commandCounters.acquire(command);
	}
}
