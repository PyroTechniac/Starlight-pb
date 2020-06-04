import { StarlightClient } from './lib/client/StarlightClient';
import { config } from 'dotenv';
import { Intents } from '@klasa/ws';
import { SchemaManager } from './lib/structures/SchemaManager';
import { WorkerCache } from './lib/workers/WorkerCache';

config();

StarlightClient.use(SchemaManager)
	.use(WorkerCache);

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
