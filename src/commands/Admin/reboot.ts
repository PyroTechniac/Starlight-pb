import type { Message } from "@klasa/core";
import { DbManager } from "@orm/DbManager";
import { mergeOptions } from "@utils/decorators";
import { Command, CommandOptions } from "klasa";

@mergeOptions<CommandOptions>({
	permissionLevel: 10,
	guarded: true,
	description: (lang): string => lang.get('COMMAND_REBOOT_DESCRIPTION')
})
export default class extends Command {
	public async run(message: Message): Promise<Message[]> {
		const [msg] = await message.replyLocale('COMMAND_REBOOT');
		const { clients } = await DbManager.connect();
		const clientSettings = await clients.acquire(this);
		clientSettings.rebootState.setMessage(msg);
		await clients.save(clientSettings);
		try {
			await Promise.all([
				...this.client.providers.map((provider): unknown => provider.shutdown()),
				this.client.destroy()
			]);
		} catch {
			// noop
		}
		process.exit();
	}
}
