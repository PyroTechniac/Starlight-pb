import { KlasaClient } from 'klasa';
import { AssetStore } from '../structures/AssetStore';

export class StarlightClient extends KlasaClient {

	public assets: AssetStore = new AssetStore(this); // eslint-disable-line @typescript-eslint/no-invalid-this

}
