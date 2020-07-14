import { StarlightClient } from '@client/StarlightClient';
import '@lib/extensions/StarlightUser';
import { config } from 'dotenv';
import 'reflect-metadata';

config();

const client = new StarlightClient();

client.token = process.env.DISCORD_TOKEN!;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
client.connect();
