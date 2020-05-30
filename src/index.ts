import { StarlightClient } from './lib/client/StarlightClient';
import { config } from 'dotenv';

config();

const client = new StarlightClient();

client.token = process.env.DISCORD_TOKEN!;

client.connect();
