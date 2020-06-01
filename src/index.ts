import { StarlightClient } from './lib/client/StarlightClient';
import { config } from 'dotenv';

config();

const client = new StarlightClient({
	commands: {
		prefix: 's.',
		logging: true,
		editing: true,
		messageLifetime: 60000
	},
	rest: {
		offset: 0
	},
	consoleEvents: {
		debug: true
	},
	cache: {
		messageLifetime: 30000,
		messageSweepInterval: 60000
	}
});

client.token = process.env.DISCORD_TOKEN!;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
client.connect();
