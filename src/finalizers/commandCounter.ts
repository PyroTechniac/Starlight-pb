import type { Message } from '@klasa/core';
import { DbManager } from '@orm/DbManager';
import type { GuildEntity } from '@orm/entities/GuildEntity';
import type { MemberEntity } from '@orm/entities/MemberEntity';
import { Command, Finalizer } from 'klasa';

export default class extends Finalizer {

	public async run(message: Message, command: Command): Promise<void> {
		const connection = await DbManager.connect();
		const clientSettings = await connection.clients.acquire(this);
		const userSettings = await connection.users.acquire(message);
		const commandCounter = await connection.commandCounters.acquire(command);
		let guildSettings: null | GuildEntity = null;
		let memberSettings: null | MemberEntity = null;
		if (message.guild) [guildSettings, memberSettings] = await this.acquireGuildAndMember(message, connection);
		clientSettings.commandUses++;
		userSettings.commandUses++;
		commandCounter.uses++;
		if (guildSettings && memberSettings) {
			guildSettings.commandUses++;
			memberSettings.commandUses++;
		}
		const toSave = [clientSettings, userSettings, commandCounter];
		if (guildSettings && memberSettings) toSave.push(guildSettings, memberSettings);
		await connection.save(toSave);
	}

	private async acquireGuildAndMember(message: Message, manager: DbManager): Promise<[GuildEntity, MemberEntity]> {
		if (!message.member) await message.guild!.members.fetch(message.author.id);
		return Promise.all([manager.guilds.acquire(message), manager.members.acquire(message)]);
	}

}
