import { Finalizer } from 'klasa';
import type { Message } from '@klasa/core';

export default class extends Finalizer {

	public async run(message: Message): Promise<void> {
		const { users } = this.client.typeORM;

		const userSettings = await users.acquire(message.author.id);
		userSettings.commandUses++;
		await users.save(userSettings);
	}

}
