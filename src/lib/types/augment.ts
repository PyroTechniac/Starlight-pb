import type { AssetStore } from '@lib/structures/AssetStore';
import type { ClientManager } from '@lib/structures/ClientManager';
import type { ContentDeliveryNetwork } from '@lib/structures/cdn/ContentDeliveryNetwork';
import type { WorkerManager } from '@lib/workers/WorkerManager';

declare module '@klasa/core/dist/src/lib/client/Client' {
	export interface Client {
		assets: AssetStore;
		readonly manager: ClientManager;
		readonly cdn: ContentDeliveryNetwork;
		readonly workers: WorkerManager;
	}
}

declare module 'klasa/dist/src/lib/structures/Provider' {
	export interface Provider {
		readonly shouldUnload: boolean; // eslint-disable-line @typescript-eslint/naming-convention
	}
}
