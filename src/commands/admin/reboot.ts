import type { Message } from '@klasa/core';
import { mergeOptions } from '@utils/decorators';
import { Command, CommandOptions } from 'klasa';
import { ClientEntity } from '@orm/entities/ClientEntity';

@mergeOptions<CommandOptions>({
	permissionLevel: 10,
	guarded: true,
	description: (lang): string => lang.get('COMMAND_REBOOT_DESCRIPTION')
})
export default class extends Command {
	public async run(message: Message): Promise<Message[]> {
		const [msg] = await message.replyLocale('COMMAND_REBOOT').catch((): Message[] => []);
		if (typeof msg !== 'undefined') await this.handleMessage(message);
		await Promise.all(this.client.providers.map((provider): unknown => provider.shutdown()));

		process.exit();
	}

	private async handleMessage(message: Message): Promise<void> {
		const settings = await ClientEntity.acquire(this);
		settings.rebootState.setMessage(message);
		await settings.save();
	}
}
