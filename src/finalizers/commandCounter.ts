import { Finalizer, Command } from 'klasa';
import type { Message } from '@klasa/core';

export default class extends Finalizer {

	public async run(message: Message, command: Command): Promise<void> {
		const { users } = this.client.typeORM;

		const userSettings = await users.acquire(message.author.id);
		userSettings.command = command.name;
		await users.save(userSettings);
	}

}
