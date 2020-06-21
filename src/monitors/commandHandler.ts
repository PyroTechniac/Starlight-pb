import { Monitor, MonitorOptions, KlasaClient } from 'klasa';
import { Stopwatch } from '@klasa/stopwatch';
import type { Message } from '@klasa/core';
import type { RateLimitToken } from '@klasa/ratelimits';
import { mergeOptions } from '@utils/decorators';

@mergeOptions<MonitorOptions>((client: KlasaClient): MonitorOptions => ({
	ignoreEdits: !client.options.commands.editing,
	ignoreOthers: false
}))
export default class extends Monitor {

	// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
	public async run(message: Message): Promise<Message[] | void> {
		if (message.guild && !message.guild.me) await message.guild.members.fetch(this.client.user!.id);
		if (!message.channel.postable) return undefined;
		if (!message.commandText && message.prefix === this.client.mentionPrefix) {
			const prefix = message.guildSettings.get('prefix') as string | string[];
			return message.replyLocale('PREFIX_REMINDER', [prefix.length ? prefix : undefined]);
		}
		if (!message.commandText) return undefined;
		if (!message.command) {
			this.client.emit('commandUnknown', message, message.commandText, message.prefix, message.prefixLength);
			return undefined;
		}
		this.client.emit('commandRun', message, message.command, message.args);

		return this.runCommand(message);
	}

	private async runCommand(message: Message): Promise<void> {
		const timer = new Stopwatch();
		if (this.client.options.commands.typing) message.channel.typing.start();
		let token: RateLimitToken | null = null;
		try {
			const command = message.command!;

			if (!this.client.owners.has(message.author) && command.cooldowns.time) {
				const ratelimit = command.cooldowns.acquire(message.guild ? Reflect.get(message, command.cooldownLevel).id : message.author.id);
				if (ratelimit.limited) throw message.language.get('INHIBITOR_COOLDOWN', Math.ceil(ratelimit.remainingTime / 1000), command.cooldownLevel !== 'author');
				token = ratelimit.take();
			}

			await this.client.inhibitors.run(message, command);
			try {
				await message.prompter!.run();
				try {
					const subCommandName = command.subcommands ? message.params.shift() as string : 'run';
					const subCommandMethod = Reflect.get(command, subCommandName);
					if (typeof subCommandMethod !== 'function') throw new TypeError(`The sub-command ${subCommandName} does not exist for ${command.name}.`);

					const result = Reflect.apply(subCommandMethod, command, [message, message.params]);
					timer.stop();
					const response = await result;

					this.client.finalizers.run(message, command, response, timer);

					token?.commit();
					this.client.emit('commandSuccess', message, command, message.params, response);
				} catch (error) {
					token?.revert();
					this.client.emit('commandError', message, command, message.params, error);
				}
			} catch (argumentError) {
				token?.revert();
				this.client.emit('argumentError', message, command, message.params, argumentError);
			}
		} catch (response) {
			token?.revert();
			this.client.emit('commandInhibited', message, message.command, response);
		} finally {
			if (this.client.options.commands.typing) message.channel.typing.stop();
		}
	}

}
