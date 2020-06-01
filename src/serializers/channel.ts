import { Serializer, SerializerUpdateContext, SchemaEntry, Language } from 'klasa';
import { ApplyOptions } from '../lib/util/decorators';
import { ChannelType } from '@klasa/dapi-types';
import { AliasPieceOptions, Channel, Channels, GuildBasedChannel } from '@klasa/core';


@ApplyOptions<AliasPieceOptions>({ aliases: ['textchannel', 'voicechannel', 'categorychannel', 'storechannel', 'newschannel'] })
export default class extends Serializer {
	public validate(data: string | Channels, { entry, language, guild }: SerializerUpdateContext): Promise<Channels> {
		if (data instanceof Channel) return this.checkChannel(data, entry, language)

		const parsed = Serializer.regex.channel.exec(data);
		const channel = parsed ? (guild || this.client).channels.get(parsed[1]) : null;
		if (channel) return this.checkChannel(channel as Channels, entry, language);
		throw language.get('RESOLVER_INVALID_CHANNEL', entry.key);
	}

	public serialize(value: GuildBasedChannel): string {
		return value.id;
	}

	public stringify(value: GuildBasedChannel): string {
		return value.name;
	}

	private checkChannel(data: Channels, entry: SchemaEntry, language: Language): Promise<Channels> {
		if (
			entry.type === 'channel' ||
			(entry.type === 'textchannel' && data.type === ChannelType.GuildText) ||
			(entry.type === 'voicechannel' && data.type === ChannelType.GuildVoice) ||
			(entry.type === 'categorychannel' && data.type === ChannelType.GuildCategory) ||
			(entry.type === 'storechannel' && data.type === ChannelType.GuildStore) ||
			(entry.type === 'newschannel' && data.type === ChannelType.GuildNews)
		) return Promise.resolve(data);
		return Promise.reject(language.get('RESOLVER_INVALID_CHANNEL'));
	}
}
