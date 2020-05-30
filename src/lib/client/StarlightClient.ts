import { Client } from '@klasa/core';
import { AssetStore } from '../structures/AssetStore';

export class StarlightClient extends Client {
	public assets: AssetStore = new AssetStore(this);
}
