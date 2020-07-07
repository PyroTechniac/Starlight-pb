import type { Message, MessageBuilder } from "@klasa/core";
import { DbManager } from "@orm/DbManager";
import { mergeOptions } from "@utils/decorators";
import { Command, CommandOptions } from "klasa";

@mergeOptions<CommandOptions>({
	description: 'Checks user profile, used for testing rn'
})
export default class extends Command {
	public async run(message: Message): Promise<Message[]> {
		const settings = await (await DbManager.connect()).users.acquire(message);
		return message.reply((mb): MessageBuilder => mb.setContent(`Current balance is: ${settings.money}, Current exp is: ${settings.points}, Current level is: ${settings.level}`));
	}
}
