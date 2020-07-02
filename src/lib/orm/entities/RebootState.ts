import { Column } from 'typeorm';
import type { Message } from '@klasa/core';

export class RebootState {

	@Column('varchar', { length: 19, nullable: true })
	public messageID: string | null = null;

	@Column('varchar', { length: 19, nullable: true })
	public channelID: string | null = null;

	public setMessage(message: Message): this {
		this.channelID = message.channel.id;
		this.messageID = message.id;
		return this;
	}

}
