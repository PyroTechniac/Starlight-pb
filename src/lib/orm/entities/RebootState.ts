import type { Message } from "@klasa/core";
import { Column } from "typeorm";

export class RebootState {
	@Column('varchar', { nullable: true, length: 19 })
	public messageID: string | null = null;

	@Column('varchar', { nullable: true, length: 19 })
	public channelID: string | null = null;

	public setMessage(message: Message): this {
		this.messageID = message.id;
		this.channelID = message.channel.id;
		return this;
	}
}
