import { Command, CommandOptions } from "klasa";
import { mergeOptions } from "@utils/decorators";
import { DbManager } from "@orm/DbManager";
import type { Message, MessageBuilder } from "@klasa/core";

@mergeOptions<CommandOptions>({
	description: "Claims daily, used for testing rn.",
	cooldown: 30
})
export default class extends Command {
	private get money(): number {
		return 200;
	}

	public async run(message: Message): Promise<Message[]> {
		const userSettings = await (await DbManager.connect()).users.acquire(message);
		await userSettings.update((data): void => {
			data.money += this.money;
		});
		return message.reply((mb): MessageBuilder => mb.setContent(`Daily claimed, new balance: ${userSettings.money}`));
	}
}
