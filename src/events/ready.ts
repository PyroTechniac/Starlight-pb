import { Event, EventOptions } from '@klasa/core';
import { mergeOptions } from '@utils/decorators';

@mergeOptions<EventOptions>({ once: true })
export default class extends Event {

	public run(): void {
		this.client.schemas.initAll();
	}

}
