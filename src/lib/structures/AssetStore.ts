import { Store, PieceConstructor, Client } from '@klasa/core';
import { Asset } from './Asset';

export class AssetStore extends Store<Asset> {

	public constructor(client: Client) {
		super(client, 'assets', Asset as unknown as PieceConstructor<Asset>);

		this.client.registerStore(this);
	}

}
