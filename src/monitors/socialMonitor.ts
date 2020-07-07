import { ClientEvents, Message } from "@klasa/core";
import { RateLimitManager } from '@klasa/ratelimits';
import { DbManager } from "@orm/DbManager";
import { Monitor, MonitorOptions } from "klasa";
import { mergeOptions } from "@utils/decorators";

@mergeOptions<MonitorOptions>({
	ignoreOthers: false
})
export default class extends Monitor {
	private readonly ratelimits = new RateLimitManager(60000, 1);

	public async run(message: Message): Promise<void> {
		try {
			this.ratelimits.acquire(message.author.id).consume();
		} catch {
			return;
		}

		try {
			const add = Math.round((Math.random() * 4) + 4);
			await this.addUserPoints(await DbManager.connect(), message.author.id, add);
		} catch (err) {
			this.client.emit(ClientEvents.Error, `Failed to add points to ${message.author.id}: ${(err && err.stack) || err}`);
		}
	}

	private async addUserPoints({ users }: DbManager, userID: string, points: number): Promise<void> {
		const settings = await users.acquire(userID);
		settings.points += points;
		await users.saveOne(settings);
	}
}
