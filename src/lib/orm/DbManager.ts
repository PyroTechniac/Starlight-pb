import { ClientEntity } from '@orm/entities/ClientEntity';
import { CommandCounterEntity } from '@orm/entities/CommandCounterEntity';
import { GuildEntity } from '@orm/entities/GuildEntity';
import { MemberEntity } from '@orm/entities/MemberEntity';
import { UserEntity } from '@orm/entities/UserEntity';
import { CamelNamingStrategy } from '@orm/util/CamelNamingStrategy';
import { rootFolder } from '@utils/constants';
import { join } from 'path';
import {
	BaseEntity, Connection,
	ConnectionOptions,
	createConnection,
	EntityManager,
	getConnection,
	Repository,
	Transaction,
	TransactionManager
} from 'typeorm';

export class DbManager {

	#connection: Connection; // eslint-disable-line @typescript-eslint/explicit-member-accessibility
	private constructor(connection: Connection) {
		this.#connection = connection;
	}

	public get users(): Repository<UserEntity> {
		return this.#connection.getRepository(UserEntity);
	}

	public get commandCounters(): Repository<CommandCounterEntity> {
		return this.#connection.getRepository(CommandCounterEntity);
	}

	public get clients(): Repository<ClientEntity> {
		return this.#connection.getRepository(ClientEntity);
	}

	public get members(): Repository<MemberEntity> {
		return this.#connection.getRepository(MemberEntity);
	}

	public get guilds(): Repository<GuildEntity> {
		return this.#connection.getRepository(GuildEntity);
	}

	public transaction<T>(transactionFn: (manager: EntityManager) => Promise<T>): Promise<T> {
		return this.#connection.transaction(transactionFn);
	}

	@Transaction()
	public async save(entities: BaseEntity[], @TransactionManager() entityManager?: EntityManager): Promise<void> {
		if (typeof entityManager === 'undefined') throw new Error('Unreachable.');
		await entityManager.save(entities);
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
		synchronize: process.env.NODE_ENV !== 'production',
		logging: process.env.NODE_ENV !== 'production',
		namingStrategy: new CamelNamingStrategy()
	};

	public static async connect(): Promise<DbManager> {
		try {
			return new DbManager(getConnection());
		} catch {
			return new DbManager(await createConnection(this.config));
		}
	}

}
