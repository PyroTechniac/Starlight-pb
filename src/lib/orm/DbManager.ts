import { ClientStorageEntity } from '@orm/entities/ClientStorageEntity';
import { CommandCounterEntity } from '@orm/entities/CommandCounterEntity';
import { MemberEntity } from '@orm/entities/MemberEntity';
import { UserEntity } from '@orm/entities/UserEntity';
import { rootFolder } from '@utils/constants';
import { join } from 'path';
import { Connection, ConnectionOptions, createConnection, EntityManager, getConnection, Repository } from 'typeorm';

export class DbManager {
	#connection: Connection;
	private constructor(connection: Connection) {
		this.#connection = connection;
	}

	public get users(): Repository<UserEntity> {
		return this.#connection.getRepository(UserEntity);
	}

	public get commandCounters(): Repository<CommandCounterEntity> {
		return this.#connection.getRepository(CommandCounterEntity);
	}

	public get clientStorages(): Repository<ClientStorageEntity> {
		return this.#connection.getRepository(ClientStorageEntity);
	}

	public get members(): Repository<MemberEntity> {
		return this.#connection.getRepository(MemberEntity);
	}

	public transaction<T>(transactionFn: (manager: EntityManager) => Promise<T>): Promise<T> {
		return this.#connection.transaction(transactionFn);
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