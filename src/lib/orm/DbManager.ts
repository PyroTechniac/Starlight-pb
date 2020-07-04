import { ClientRepository } from '@orm/repositories/ClientRepository';
import { CommandCounterRepository } from '@orm/repositories/CommandCounterRepository';
import { GuildRepository } from '@orm/repositories/GuildRepository';
import { MemberRepository } from '@orm/repositories/MemberRepository';
import { UserRepository } from '@orm/repositories/UserRepository';
import { rootFolder } from '@utils/constants';
import { join } from 'path';
import {
	Connection,
	ConnectionOptions,
	createConnection,
	EntityManager,
	getConnection,
	Transaction,
	TransactionManager,
	ObjectLiteral
} from 'typeorm';

export class DbManager {

	#connection: Connection; // eslint-disable-line @typescript-eslint/explicit-member-accessibility

	private constructor(connection: Connection) {
		this.#connection = connection;
	}

	public get users(): UserRepository {
		return this.#connection.getCustomRepository(UserRepository);
	}

	public get commandCounters(): CommandCounterRepository {
		return this.#connection.getCustomRepository(CommandCounterRepository);
	}

	public get clients(): ClientRepository {
		return this.#connection.getCustomRepository(ClientRepository);
	}

	public get members(): MemberRepository {
		return this.#connection.getCustomRepository(MemberRepository);
	}

	public get guilds(): GuildRepository {
		return this.#connection.getCustomRepository(GuildRepository);
	}

	public transaction<T>(transactionFn: (manager: EntityManager) => Promise<T>): Promise<T> {
		return this.#connection.transaction(transactionFn);
	}

	@Transaction()
	public save<V extends ObjectLiteral>(entities: V[], @TransactionManager() entityManager?: EntityManager): Promise<V[]> {
		if (typeof entityManager === 'undefined') throw new Error('Unreachable');
		return entityManager.save(entities);
	}

	public async destroy(): Promise<void> {
		await this.#connection.close();
	}

	public static config: ConnectionOptions = {
		type: 'sqlite',
		database: process.env.TYPEORM_DATABASE ?? join(rootFolder, 'bwd', 'connection', 'sqlite', 'db.sqlite'),
		entities: [
			join(__dirname, 'entities/*.js')
		],
		migrations: [
			join(__dirname, 'migrations/*.js')
		],
		logging: process.env.NODE_ENV !== 'production',
		cli: {
			entitiesDir: 'src/lib/orm/entities',
			migrationsDir: 'src/lib/orm/migrations',
			subscribersDir: 'src/lib/orm/subsciptions'
		}
	};

	public static async connect(): Promise<DbManager> {
		try {
			return new DbManager(getConnection());
		} catch {
			return new DbManager(await createConnection(this.config));
		}
	}

}
