import { join } from 'path';
import { Connection, createConnection } from 'typeorm';
import { UserRepository } from '@lib/structures/UserRepository';
import type { ClientEngine } from '@lib/types/interfaces';
import type { ClientManager } from '@lib/structures/ClientManager';
import type { KlasaClient } from 'klasa';

export class TypeORMEngine implements ClientEngine {

	public connection: Connection | null = null;

	public constructor(public readonly manager: ClientManager) { }

	public get client(): KlasaClient {
		return this.manager.client;
	}

	public get users(): UserRepository {
		if (this.connection === null) throw new Error('Cannot get UserRepository of null connection.');
		return this.connection.getCustomRepository(UserRepository);
	}

	public async connect(): Promise<void> {
		this.connection = await createConnection({
			type: 'sqlite',
			database: process.env.TYPEORM_DATABASE ?? join(this.client.userBaseDirectory, 'bwd', 'connection', 'sqlite', 'db.sqlite'),
			entities: [join(__dirname, '../', 'entities/*.js')],
			synchronize: !this.client.options.production
		});
	}

	public async disconnect(): Promise<void> {
		await this.connection?.close() ?? Promise.resolve();
	}

}
