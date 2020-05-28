import { sleep } from '@klasa/utils';
import { inspect } from 'util';


import type { Message, MessageBuilder, Embed } from '@klasa/core';

export const commands: Record<string, (message: Message, args: string[]) => Promise<Message | Message[]>> = {
	async ping(message: Message): Promise<Message> {
		const [response] = await message.channel.send((mb): MessageBuilder => mb.setContent('ping?'));
		return response.edit((mb): MessageBuilder => mb.setContent(`Pong! Took ${response.createdTimestamp - message.createdTimestamp}ms`));
	},

	async eval(message: Message, args: string[]): Promise<Message[]> {
		/* eslint-disable @typescript-eslint/no-unsafe-assignment */
		// eslint-disable-next-line @typescript-eslint/init-declarations
		let returned: unknown;
		try {
			// eslint-disable-next-line no-eval
			returned = await eval(args.join(' '));
		} catch (error) {
			returned = error;
		}
		/* eslint-enable @typescript-eslint/no-unsafe-assignment */
		// eslint-disable-next-line @typescript-eslint/require-await
		return message.channel.send(async (mb): Promise<MessageBuilder> => mb.setContent(`\`\`\`\n${inspect(returned, { depth: 0 })}\n\`\`\``));
	},

	info(message: Message): Promise<Message[]> {
		return message.channel.send((mb): MessageBuilder => mb
			.setEmbed((embed): Embed => embed
				.setTitle('Hello from Project Blue (@klasa/core)')
				.setDescription(`
We have been working hard on this project, and really kicked ass as of late.
The core library is written in TypeScript, and our utilities are separate and tested.
The websocket connections are in workers, so you won't stop their beating heart with any while loops.
The rest manager utilizes hashes to maximize your sending experience.`)
				.setColor(0x0066FF)
				.setImage('https://i.ytimg.com/vi/hAsZCTL__lo/maxresdefault.jpg')));
	},

	async type(message: Message): Promise<Message[]> {
		await sleep(20000);
		return message.channel.send((mb): MessageBuilder => mb
			.setContent('gosh that\'s a slow command'));
	},

	async wait(message: Message): Promise<Message[]> {
		await message.channel.send((mb): MessageBuilder => mb.setContent('Waiting for 4 messages'));
		console.log('Before collected');
		const collected = await message.channel.awaitMessages({ limit: 4 });
		console.log('After collected');
		return message.channel.send((mb): MessageBuilder => mb
			.setContent(collected.map((mes): string => mes.content).join('\n')));
	}
};
