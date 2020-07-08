import { Monitor, MonitorOptions } from "klasa";
import { mergeOptions } from "@utils/decorators";
import { DbManager } from "@orm/DbManager";
import type { Message } from "@klasa/core";

@mergeOptions<MonitorOptions>({
	ignoreOthers: false
})
export default class extends Monitor {
	public async run(message: Message): Promise<void> {
		const userSettings = await (await DbManager.connect()).users.acquire(message);

		await userSettings.update((data): void => {
			data.points += Math.round((Math.random() * 4) + 4);
		});
	}
}
