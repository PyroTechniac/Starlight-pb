import { Command, CommandOptions } from "klasa";
import { mergeOptions } from "@utils/decorators";
import type { Message, MessageBuilder } from "@klasa/core";
import { DbManager } from "@orm/DbManager";

@mergeOptions<CommandOptions>({
	description: 'Checks profile, used for testing rn'
})
export default class extends Command {
	public async run(message: Message): Promise<Message[]> {
		const settings = await (await DbManager.connect()).users.acquire(message);
		return message.reply((mb): MessageBuilder => mb.setContent(`Current money is: ${settings.money}. Current points are: ${settings.points}. Current level is: ${settings.level}`));
	}
}
