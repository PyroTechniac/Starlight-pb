import { Inhibitor, Command } from 'klasa';
import type { Message } from '@klasa/core';
import { ChannelType } from '@klasa/dapi-types';

export default class extends Inhibitor {

	public run(message: Message, command: Command): void {
		if (!command.runIn.length) throw message.language.get('INHIBITOR_RUNIN_NONE', command.name);
		if (!command.runIn.includes(message.channel.type)) throw message.language.get('INHIBITOR_RUNIN', command.runIn.map(this.resolveType.bind(this)).join(', '));
	}

	private resolveType(type: ChannelType): string {
		switch (type) {
			case ChannelType.GuildText: return 'text';
			case ChannelType.DM: return 'dm';
			default: throw new Error(`${type} is not a valid runIn setting for Commands`);
		}
	}

}
