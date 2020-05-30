import type { AssetOptions } from '../structures/Asset';

declare module '@klasa/core/dist/src/lib/client/Client' {
	interface PieceDefaults {
		assets?: Partial<AssetOptions>;
	}
}
