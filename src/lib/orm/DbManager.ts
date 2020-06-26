import { CommandCounterEntity } from '@orm/entities/CommandCounterEntity';
import { UserEntity } from '@orm/entities/UserEntity';
import { Connection, Repository, ConnectionOptions, getConnection, createConnection } from 'typeorm';
import { join } from 'path';
import { rootFolder } from '@utils/constants';

export class DbManager {
	#connection: Connection;
	private constructor(connection: Connection) {
		this.#connection = connection;
	}

	public get connection(): Connection {
		return this.#connection;
	}

	public get users(): Repository<UserEntity> {
		return this.connection.getRepository(UserEntity);
	}

	public get commandCounters(): Repository<CommandCounterEntity> {
		return this.connection.getRepository(CommandCounterEntity);
	}

	public static config: ConnectionOptions = {
		type: 'sqlite',
		database: process.env.TYPEORM_DATABASE ?? join(rootFolder, 'bwd', 'connection', 'sqlite', 'db.sqlite'),
		entities: [
			join(__dirname, 'entities/*.js')
		],
		synchronize: process.env.NODE_ENV !== 'production',
		logging: process.env.NODE_ENV !== 'production'
	}

	public static async connect(): Promise<DbManager> {
		try {
			return new DbManager(getConnection());
		} catch {
			return new DbManager(await createConnection(this.config));
		}
	}
}