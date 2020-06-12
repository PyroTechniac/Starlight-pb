import type { Message } from '@klasa/core';
import { codeBlock, toTitleCase } from '@klasa/utils';
import type { ConfCommand } from '@lib/types/interfaces';
import { createResolvers, mergeOptions } from '@utils/decorators';
import { Command, CommandOptions, SchemaEntry, SettingsFolder } from 'klasa';

// It is disabled, but kept for backwards compatibility
@mergeOptions<CommandOptions>({
	enabled: false,
	guarded: true,
	subcommands: true,
	description: (lang): string => lang.get('COMMAND_CONF_USER_DESCRIPTION'),
	usage: '<set|remove|reset|show:default> (key:key) (value:value)',
	usageDelim: ' '
})
@createResolvers([
	['key', (arg, _possible, message, [action]): any => {
		if (action === 'show' || arg) return arg || ''; // eslint-disable-line @typescript-eslint/no-unsafe-return
		throw message.language.get('COMMAND_CONF_NOKEY');
	}],
	['value', (arg, possible, message, [action]): any => {
		if (!['set', 'remove'].includes(action)) return null;
		if (arg) return message.client.arguments.get('...string')!.run(arg, possible, message);
		throw message.language.get('COMMAND_CONF_NOVALUE');
	}]
])
export default class extends Command implements ConfCommand {

	public show(message: Message, [key]: [string]): Promise<Message[]> {
		const schemaOrEntry = this.client.schemas.get('users', key);
		if (typeof schemaOrEntry === 'undefined') throw message.language.get('COMMAND_CONF_GET_NOEXT', key);

		const value = key ? message.author.settings.get(key) : message.author.settings;
		if (SchemaEntry.is(schemaOrEntry)) {
			return message.sendLocale('COMMAND_CONF_GET', [key, this.client.schemas.displayEntry(schemaOrEntry, value, message.guild)]);
		}

		return message.sendLocale('COMMAND_CONF_USER', [
			key ? `: ${key.split('.').map(toTitleCase).join('/')}` : '',
			codeBlock('asciidoc', this.client.schemas.displayFolder('users', value as SettingsFolder))
		]);
	}

	public set(message: Message, [key, valueToSet]: [string, unknown]): Promise<Message[]> {
		return this.editSettings(message, key, valueToSet, 'add');
	}

	public remove(message: Message, [key, valueToRemove]: [string, unknown]): Promise<Message[]> {
		return this.editSettings(message, key, valueToRemove, 'remove');
	}

	public async reset(message: Message, [key]: [string]): Promise<Message[]> {
		try {
			const [update] = await message.author.settings.reset(key);
			return message.sendLocale('COMMAND_CONF_RESET', [key, this.client.schemas.displayEntry(update.entry, update.next, message.guild)]);
		} catch (error) {
			throw String(error);
		}
	}

	private async editSettings(message: Message, key: string, value: unknown, arrayAction: 'add' | 'remove'): Promise<Message[]> {
		try {
			const [update] = await message.author.settings.update(key, value, { onlyConfigurable: true, arrayAction });
			return message.sendLocale('COMMAND_CONF_UPDATED', [key, this.client.schemas.displayEntry(update.entry, update.next, message.guild)]);
		} catch (error) {
			throw String(error);
		}
	}

}
