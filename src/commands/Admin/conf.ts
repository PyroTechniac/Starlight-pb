import { Message } from '@klasa/core';
import { ChannelType } from '@klasa/dapi-types';
import { codeBlock, toTitleCase } from '@klasa/utils';
import { Command, CommandOptions, SchemaEntry, SettingsFolder } from 'klasa';
import type { ConfCommand } from '../../lib/types/interfaces';
import { mergeOptions, requiresPermission } from '../../lib/util/decorators';

@mergeOptions<CommandOptions>({
	runIn: [ChannelType.GuildText],
	guarded: true,
	subcommands: true,
	description: (lang): string => lang.get('COMMAND_CONF_SERVER_DESCRIPTION'),
	usage: '<set|remove|reset|show:default> (key:key) (value:value)',
	usageDelim: ' '
})
export default class extends Command implements ConfCommand {

	public init(): void {
		this
			.createCustomResolver('key', (arg, _possible, message, [action]): any => {
				if (action === 'show' || arg) return arg || ''; // eslint-disable-line @typescript-eslint/no-unsafe-return
				throw message.language.get('COMMAND_CONF_NOKEY');
			})
			.createCustomResolver('value', (arg, possible, message, [action]): any => {
				if (!['set', 'remove'].includes(action)) return null;
				if (arg) return this.client.arguments.get('...string')!.run(arg, possible, message);
				throw message.language.get('COMMAND_CONF_NOVALUE');
			});
	}

	@requiresPermission(6)
	public show(message: Message, [key]: [string]): Promise<Message[]> {
		const schemaOrEntry = this.client.schemas.get('guilds', key);
		if (typeof schemaOrEntry === 'undefined') throw message.language.get('COMMAND_CONF_GET_NOEXT', key);

		const value = key ? message.guild!.settings.get(key) : message.guild!.settings;
		if (SchemaEntry.is(schemaOrEntry)) {
			return message.sendLocale('COMMAND_CONF_GET', [key, this.client.schemas.displayEntry(schemaOrEntry, value, message.guild)]);
		}

		return message.sendLocale('COMMAND_CONF_SERVER', [
			key ? `: ${key.split('.').map(toTitleCase).join('/')}` : '',
			codeBlock('asciidoc', this.client.schemas.displayFolder('guilds', value as SettingsFolder))
		]);
	}

	public set(message: Message, [key, valueToSet]: [string, unknown]): Promise<Message[]> {
		return this.editSettings(message, key, valueToSet, 'add');
	}

	public remove(message: Message, [key, valueToRemove]: [string, unknown]): Promise<Message[]> {
		return this.editSettings(message, key, valueToRemove, 'remove');
	}

	@requiresPermission(6)
	public async reset(message: Message, [key]: [string]): Promise<Message[]> {
		try {
			const [update] = await message.guild!.settings.reset(key);
			return message.sendLocale('COMMAND_CONF_RESET', [key, this.client.schemas.displayEntry(update.entry, update.next, message.guild)]);
		} catch (error) {
			throw String(error);
		}
	}

	@requiresPermission(6)
	private async editSettings(message: Message, key: string, value: unknown, arrayAction: 'add' | 'remove'): Promise<Message[]> {
		try {
			const [update] = await message.guild!.settings.update(key, value, { onlyConfigurable: true, arrayAction });
			return message.sendLocale('COMMAND_CONF_UPDATED', [key, this.client.schemas.displayEntry(update.entry, update.next, message.guild)]);
		} catch (error) {
			throw String(error);
		}
	}

}
