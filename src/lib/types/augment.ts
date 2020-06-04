import type { AssetStore } from '../structures/AssetStore';
import type { SchemaManager } from '../structures/SchemaManager';
import type { WorkerCache } from '../workers/WorkerCache';

declare module '@klasa/core/dist/src/lib/client/Client' {
	export interface Client {
		assets: AssetStore;
		schemas: SchemaManager;
		workers: WorkerCache;
	}
}

declare module 'klasa/dist/src/lib/structures/Provider' {
	export interface Provider {
		readonly shouldUnload: boolean; // eslint-disable-line @typescript-eslint/naming-convention
	}
}
