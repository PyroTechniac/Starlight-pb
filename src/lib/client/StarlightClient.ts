import { AssetStore } from '@lib/structures/AssetStore';
import { ClientManager } from '@lib/structures/ClientManager';
import type { TypeORMEngine } from '@lib/structures/TypeORMEngine';
import { KlasaClient } from 'klasa';

export class StarlightClient extends KlasaClient {

	/* eslint-disable @typescript-eslint/no-invalid-this */
	public readonly manager: ClientManager = new ClientManager(this);

	public assets: AssetStore = new AssetStore(this);
	/* eslint-enable @typescript-eslint/no-invalid-this */

	public get typeORM(): TypeORMEngine {
		return this.manager.typeORM;
	}

	public async connect(): Promise<void> {
		if (this['pluginLoadedCount'] !== KlasaClient['plugins'].size) this.loadPlugins(); // eslint-disable-line @typescript-eslint/no-unsafe-member-access
		// await Promise.all([this.connect(), super.connect()]);
		await Promise.all([this.typeORM.connect(), super.connect()]);
	}

	public async destroy(): Promise<void> {
		await Promise.all([this.typeORM.disconnect(), super.destroy()]);
	}

}
