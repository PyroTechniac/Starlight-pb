import type { Message } from '@klasa/core';
import { mergeOptions } from '@utils/decorators';
import { Command, CommandOptions } from 'klasa';
import { writeHeapSnapshot } from 'v8';

@mergeOptions<CommandOptions>({
	permissionLevel: 10,
	guarded: true,
	description: (lang): string => lang.get('COMMAND_HEAPSNAPSHOT_DESCRIPTION'),
	extendedHelp: (lang): string => lang.get('COMMAND_HEAPSNAPSHOT_EXTENDEDHELP')
})
export default class extends Command {

	public async run(message: Message): Promise<Message[]> {
		await message.replyLocale('COMMAND_HEAPSNAPSHOT_CAPTURING');

		const filename = writeHeapSnapshot();

		return message.replyLocale('COMMAND_HEAPSNAPSHOT_CAPTURED', [filename]);
	}

}
