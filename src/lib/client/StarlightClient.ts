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
	}

	public async connect(): Promise<void> {
		if (this['pluginLoadedCount'] !== KlasaClient['plugins'].size) this.loadPlugins(); // eslint-disable-line @typescript-eslint/no-unsafe-member-access
		await Promise.all([DbManager.connect(), super.connect()]);
	}
}
