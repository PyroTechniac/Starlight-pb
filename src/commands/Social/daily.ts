import type { Message, MessageBuilder } from "@klasa/core";
import { DbManager } from "@orm/DbManager";
import type { UserEntity } from "@orm/entities/UserEntity";
import { mergeOptions } from "@utils/decorators";
import { Command, CommandOptions } from "klasa";

@mergeOptions<CommandOptions>({
	aliases: ['dailies'],
	cooldown: 30,
	description: 'Claims dailies, testing with it rn'
})
export default class extends Command {
	private get money(): number {
		return 200;
	}

	public async run(message: Message): Promise<Message[]> {
		const { money } = await this.claimDaily(message, await DbManager.connect());
		return message.reply((mb): MessageBuilder => mb.setContent(`Successfully claimed daily, new balance: ${money}`));
	}

	private async claimDaily(message: Message, { users }: DbManager): Promise<UserEntity> {
		const { money } = this;
		const settings = await users.acquire(message);

		settings.money += money;

		return users.saveOne(settings);
	}
}
