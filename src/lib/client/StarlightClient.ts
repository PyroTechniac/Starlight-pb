import { mergeDefault } from '@klasa/utils';
import { AssetStore } from '@lib/structures/AssetStore';
import type { ContentDeliveryNetwork } from '@lib/structures/cdn/ContentDeliveryNetwork';
import { ClientManager } from '@lib/structures/ClientManager';
import { DbManager } from '@orm/DbManager';
import { STARLIGHT_OPTIONS } from '@utils/constants';
import { KlasaClient, KlasaClientOptions } from 'klasa';
import type { WorkerManager } from '@lib/workers/WorkerManager';
import { UserGateway } from '@lib/structures/settings/UserGateway';
import { singleton} from 'tsyringe';

@singleton()
export class StarlightClient extends KlasaClient {

	public readonly manager: ClientManager = new ClientManager(this);

	public assets: AssetStore = new AssetStore(this);

	public get cdn(): ContentDeliveryNetwork {
		return this.manager.cdn;
	}

	public get workers(): WorkerManager {
		return this.manager.workers;
	}

	public constructor(options: Partial<KlasaClientOptions> = {}) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		super(mergeDefault(STARLIGHT_OPTIONS, options));
		this.gateways.register(new UserGateway(this));
		this.loadPlugins();
	}

	public async connect(): Promise<void> {
		await DbManager.connect();
		await super.connect();
		await this.workers.init();
	}

	public async destroy(): Promise<void> {
		const connection = await DbManager.connect();
		await Promise.all([connection.destroy(), super.destroy(), this.workers.destroy()]);
	}

}
