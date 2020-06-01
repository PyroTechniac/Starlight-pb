import type { AssetStore } from '../structures/AssetStore';

declare module '@klasa/core/dist/src/lib/client/Client' {
	export interface Client {
		assets: AssetStore;
	}
}
