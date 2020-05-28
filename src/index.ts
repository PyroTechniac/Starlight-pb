import { Client, ClientEvents, Message } from '@klasa/core';
import { Intents } from '@klasa/ws';
import { EventIterator } from '@klasa/event-iterator';
import { commands } from './commands';
import * as config from './config.json';

interface Config {
	idle?: number;
	id: string;
	token: string;
}

const { idle, id, token }: Config = config;

const client = new Client({ ws: { intents: Intents.DEFAULT_WITH_MEMBERS }, rest: { offset: 0 } })
	.on(ClientEvents.Debug, console.log)
	.on(ClientEvents.WTF, console.log)
	.on(ClientEvents.EventError, console.log)
	.on(ClientEvents.Ready, (): void => console.log('Ready'));

client.token = token;

client.connect()
	.then(async (): Promise<void> => {
		for await (const message of new EventIterator<Message>(client, ClientEvents.MessageCreate, { idle, filter: (message): boolean => message.author.id === id })) {
			const split = message.content.split(' ');
			const command = split.shift();
			if (Reflect.has(commands, command!)) {
				message.channel.typing.start();
				commands[command!](message, split)
					.catch(console.error)
					.finally(message.channel.typing.stop.bind(message.channel.typing));
			}
		}
	})
	.catch(console.error)
	.finally(client.destroy.bind(client));
