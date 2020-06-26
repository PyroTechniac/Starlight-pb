import { Finalizer, Command } from 'klasa';
import type { Message } from '@klasa/core';
import { DbManager } from '@orm/DbManager';

export default class extends Finalizer {
	public async run(_message: Message, command: Command): Promise<void> {
		const connection = await DbManager.connect();
		await connection.commandCounters.increment({ id: command.name }, 'uses', 1);
	}
}