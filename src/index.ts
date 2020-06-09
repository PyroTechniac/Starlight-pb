import { StarlightClient } from './lib/client/StarlightClient';
import { config } from 'dotenv';
import { Intents } from '@klasa/ws';
import { SchemaEngine } from './lib/structures/SchemaEngine';
import { DashboardHooks } from './lib/http/DashboardHooks';

config();

StarlightClient.use(SchemaEngine)
	.use(DashboardHooks);

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
	},
	hooks: {
		clientID: process.env.CLIENT_ID,
		clientSecret: process.env.CLIENT_SECRET
	}
});

client.token = process.env.DISCORD_TOKEN!;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
client.connect();
