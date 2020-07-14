import { TaskEntity } from '@lib/orm/entities/TaskEntity';
import { ClientRepository } from '@orm/repositories/ClientRepository';
import { CommandCounterRepository } from '@orm/repositories/CommandCounterRepository';
import { GuildRepository } from '@orm/repositories/GuildRepository';
import { UserRepository } from '@orm/repositories/UserRepository';
import { join } from 'path';
import {
	Connection,
	ConnectionOptions,
	createConnection,
	EntityManager,
	getConnection,
	ObjectLiteral,
	QueryRunner,
	Repository,
	Transaction,
	TransactionManager
} from 'typeorm';
import { ensureOrThrow } from '@utils/util';

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

	public get guilds(): GuildRepository {
		return this.#connection.getCustomRepository(GuildRepository);
	}

	public get tasks(): Repository<TaskEntity> {
		return this.#connection.getRepository(TaskEntity);
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

	public startQueryRunner(): QueryRunner {
		return this.#connection.createQueryRunner();
	}

	public static config: ConnectionOptions = {
		type: 'postgres',
		host: ensureOrThrow(process.env.POSTGRES_HOST, new Error('PG host not found')),
		username: ensureOrThrow(process.env.POSTGRES_USERNAME, new Error('PG user not found')),
		password: ensureOrThrow(process.env.POSTGRES_PASSWORD, new Error('PG password not found')),
		database: ensureOrThrow(process.env.POSTGRES_DATABASE, new Error('PG database not found')),
		entities: [
			join(__dirname, 'entities/*.js')
		],
		migrations: [
			join(__dirname, 'migrations/*.js')
		],
		subscribers: [
			join(__dirname, 'subscriptions/*.js')
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

export default DbManager.config;
