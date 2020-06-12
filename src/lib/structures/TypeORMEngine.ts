import type { Client } from '@klasa/core';
import { join } from 'path';
import { Connection, createConnection } from 'typeorm';
import { UserRepository } from './UserRepository';

export class TypeORMEngine {

	public connection: Connection | null = null;

	public constructor(public readonly client: Client) { }

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
