import { mergeDefault } from '@klasa/utils';
import { AssetStore } from '@lib/structures/AssetStore';
import type { ContentDeliveryNetwork } from '@lib/structures/cdn/ContentDeliveryNetwork';
import { ClientManager } from '@lib/structures/ClientManager';
import { DbManager } from '@orm/DbManager';
import { STARLIGHT_OPTIONS } from '@utils/constants';
import { KlasaClient, KlasaClientOptions } from 'klasa';

export class StarlightClient extends KlasaClient {

	public readonly manager: ClientManager = new ClientManager(this);

	public assets: AssetStore = new AssetStore(this);

	public get cdn(): ContentDeliveryNetwork {
		return this.manager.cdn;
	}

	public constructor(options: Partial<KlasaClientOptions> = {}) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		super(mergeDefault(STARLIGHT_OPTIONS, options));
		this.loadPlugins();
	}

	public async connect(): Promise<void> {
		await DbManager.connect();
		await super.connect();
	}

	public async destroy(): Promise<void> {
		const connection = await DbManager.connect();
		await Promise.all([connection.destroy(), super.destroy()]);
	}
}
