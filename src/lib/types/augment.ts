import type { AssetOptions } from '../structures/Asset';
import type { AssetStore } from '../structures/AssetStore';

declare module '@klasa/core/dist/src/lib/client/Client' {
	export interface Client {
		assets: AssetStore;
	}

	export interface PieceDefaults {
		assets?: Partial<AssetOptions>;
	}
}
