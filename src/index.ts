import { StarlightClient } from './lib/client/StarlightClient';
import { config } from 'dotenv';
import { SchemaManager } from './lib/structures/SchemaManager';

config();

StarlightClient.use(SchemaManager);

const client = new StarlightClient({
	commands: {
		prefix: 's.',
		logging: true,
		editing: true
	},
	rest: {
		offset: 0
	},
	consoleEvents: {
		debug: true
	}
});

client.token = process.env.DISCORD_TOKEN!;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
client.connect();
