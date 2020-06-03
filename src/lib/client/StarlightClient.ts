import { KlasaClient } from 'klasa';
import { AssetStore } from '../structures/AssetStore';
import '../schemas/Guilds';

import type { Client, Plugin } from '@klasa/core';
import type { StarlightPlugin } from './StarlightPlugin';

export class StarlightClient extends KlasaClient {

	public assets: AssetStore = new AssetStore(this); // eslint-disable-line @typescript-eslint/no-invalid-this

	public connect(): Promise<void> {
		if (this['pluginLoadedCount'] !== KlasaClient['plugins'].size) this.loadPlugins(); // eslint-disable-line @typescript-eslint/no-unsafe-member-access
		return super.connect();
	}

	public static use(mod: StarlightPlugin): typeof Client {
		return super.use(mod as unknown as typeof Plugin);
	}

}
