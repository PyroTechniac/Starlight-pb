import type { Message } from '@klasa/core';
import { Command, Finalizer } from 'klasa';

export default class extends Finalizer {

	public async run(message: Message, command: Command): Promise<void> {
		const { users, clientStorage } = this.client.typeORM;

		const [userSettings, clientSettings] = await Promise.all([users.acquire(message.author.id), clientStorage.acquire(this.client.user!.id)]);
		userSettings.command = command.name;
		clientSettings.command = command.name;
		await users.save(userSettings);
		await clientStorage.save(clientSettings);
	}

}
