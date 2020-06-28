import { Event, EventOptions } from "@klasa/core";
import { CommandCounterEntity } from '@orm/entities/CommandCounterEntity';
import { mergeOptions } from "@utils/decorators";
import { DbManager } from "@orm/DbManager";

@mergeOptions<EventOptions>({
	once: true
})
export default class extends Event {
	public async run(): Promise<void> {
		const manager = await DbManager.connect();
		const existing = await manager.commandCounters.find();

		await Promise.all(
			this.client.commands
				.filter((command): boolean => !existing.some((entry): boolean => entry.id === command.name))
				.map(CommandCounterEntity.acquire.bind(CommandCounterEntity))
		);
	}
}