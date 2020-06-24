import type { ClientManager } from '@lib/structures/ClientManager';
import type { ClientEngine } from '@lib/types/interfaces';
import { ClientStorage } from '@orm/entities/ClientStorage';
import { Users } from '@orm/entities/Users';
import { ClientRepository } from '@orm/repositories/ClientRepository';
import { UserRepository } from '@orm/repositories/UserRepository';
import { rootFolder } from '@utils/constants';
import type { KlasaClient } from 'klasa';
import { join } from 'path';
import { Connection, createConnection } from 'typeorm';

export class TypeORMEngine implements ClientEngine {

	public connection: Connection | null = null;

	public constructor(public readonly manager: ClientManager) { }

	public get client(): KlasaClient {
		return this.manager.client;
	}

	public get users(): UserRepository {
		if (this.connection === null) throw new Error('Cannot get UserRepository without connection.');
		return this.connection.getCustomRepository(UserRepository);
	}

	public get clientStorage(): ClientRepository {
		if (this.connection === null) throw new Error('Cannot get ClientRepository without connection.');
		return this.connection.getCustomRepository(ClientRepository);
	}

	public async connect(): Promise<void> {
		this.connection = await createConnection({
			type: 'sqlite',
			database: process.env.TYPEORM_DATABASE ?? join(rootFolder, 'bwd', 'connection', 'sqlite', 'db.sqlite'),
			entities: [Users, ClientStorage],
			synchronize: !this.client.options.production
		});
	}

	public async disconnect(): Promise<void> {
		await this.connection?.close() ?? Promise.resolve();
	}

}
