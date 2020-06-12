import type { StarlightPlugin } from '@client/StarlightPlugin';
import type { Plugin } from '@klasa/core';
import { AssetStore } from '@lib/structures/AssetStore';
import { TypeORMEngine } from '@lib/structures/TypeORMEngine';
import { KlasaClient } from 'klasa';

export class StarlightClient extends KlasaClient {

	/* eslint-disable @typescript-eslint/no-invalid-this */
	public typeORM: TypeORMEngine = new TypeORMEngine(this);

	public assets: AssetStore = new AssetStore(this);
	/* eslint-enable @typescript-eslint/no-invalid-this */

	public async connect(): Promise<void> {
		if (this['pluginLoadedCount'] !== KlasaClient['plugins'].size) this.loadPlugins(); // eslint-disable-line @typescript-eslint/no-unsafe-member-access
		// await Promise.all([this.connect(), super.connect()]);
		await Promise.all([this.typeORM.connect(), super.connect()]);
	}

	public async destroy(): Promise<void> {
		await Promise.all([this.typeORM.disconnect(), super.destroy()]);
	}

	public static use(mod: StarlightPlugin): typeof StarlightClient {
		super.use(mod as unknown as typeof Plugin);
		return StarlightClient;
	}

}
