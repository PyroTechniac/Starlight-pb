import { Intents } from '@klasa/ws';
import { config } from 'dotenv';
import 'module-alias/register';
import 'reflect-metadata';
import { StarlightClient } from '@client/StarlightClient';
import '@lib/extensions/StarlightUser';

config();

const client = new StarlightClient({
	commands: {
		prefix: process.env.PREFIX ?? '!',
		logging: true,
		editing: true
	},
	rest: {
		offset: 0
	},
	ws: {
		intents: Intents.ALL
	},
	consoleEvents: {
		debug: true
	},
	providers: {
		'default': process.env.PROVIDER ?? 'json'
	}
});

client.token = process.env.DISCORD_TOKEN!;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
client.connect();
