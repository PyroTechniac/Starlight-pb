import { KlasaClient, KlasaClientOptions } from 'klasa';
import { AssetStore } from '../structures/AssetStore';

export class StarlightClient extends KlasaClient {

	public assets: AssetStore = new AssetStore(this); // eslint-disable-line @typescript-eslint/no-invalid-this

	public constructor(options: Partial<KlasaClientOptions> = {}) {
		super(options);

		this.registerStore(this.assets);
	}

}
