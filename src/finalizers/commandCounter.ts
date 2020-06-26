import type { Message } from '@klasa/core';
import { DbManager } from '@orm/DbManager';
import { ClientStorageEntity } from '@orm/entities/ClientStorageEntity';
import { GuildEntity } from '@orm/entities/GuildEntity';
import { MemberEntity } from '@orm/entities/MemberEntity';
import { UserEntity } from '@orm/entities/UserEntity';
import { Command, Finalizer } from 'klasa';
import type { BaseEntity } from 'typeorm';
import { CommandCounterEntity } from '@orm/entities/CommandCounterEntity';

export default class extends Finalizer {
	public async run(message: Message, command: Command): Promise<void> {
		const connection = await DbManager.connect();
		// await connection.commandCounters.increment({ id: command.name }, 'uses', 1);
		await connection.transaction(async (manager): Promise<void> => {
			const clientSettings = await ClientStorageEntity.acquire(this.client.user!.id);
			const userSettings = await UserEntity.acquire(message.author.id);
			const commandCounter = await CommandCounterEntity.acquire(command.name);
			let guildSettings: null | GuildEntity = null;
			let memberSettings: null | MemberEntity = null;
			if (message.guild) [guildSettings, memberSettings] = await this.acquireGuildAndMember(message);
			clientSettings.commandUses++;
			userSettings.commandUses++;
			commandCounter.uses++;
			if (guildSettings && memberSettings) {
				guildSettings.commandUses++;
				memberSettings.commandUses++;
			}
			const toSave: BaseEntity[] = [clientSettings, userSettings, commandCounter];
			if (guildSettings && memberSettings) toSave.push(guildSettings, memberSettings);
			await manager.save(toSave);
		})
	}

	private async acquireGuildAndMember(message: Message): Promise<[GuildEntity, MemberEntity]> {
		if (!message.member) await message.guild!.members.fetch(message.author.id);
		return Promise.all([GuildEntity.acquire(message.guild!.id), MemberEntity.acquire(message.guild!.id, message.author.id)]) as Promise<[GuildEntity, MemberEntity]>;
	}
}