import { Event, EventOptions } from "@klasa/core";
import { CommandCounterEntity } from '@orm/entities/CommandCounterEntity';
import { mergeOptions } from "@utils/decorators";
import { DbManager } from "@orm/DbManager";

@mergeOptions<EventOptions>({
	once: true
})
export default class extends Event {
	public async run(): Promise<void> {
		await DbManager.connect();
		await Promise.all(this.client.commands.map((__, name): Promise<CommandCounterEntity> => CommandCounterEntity.acquire(name)));
	}
}