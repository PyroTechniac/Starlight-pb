import { ContentDeliveryNetwork } from '@lib/structures/cdn/ContentDeliveryNetwork';
import type { ClientEngine } from '@lib/types/interfaces';
import { WorkerManager } from '@lib/workers/WorkerManager';
import type { KlasaClient } from 'klasa';

export class ClientManager implements ClientEngine {

	public cdn: ContentDeliveryNetwork = new ContentDeliveryNetwork(this);

	public workers: WorkerManager = new WorkerManager(this);

	public constructor(public readonly client: KlasaClient) { }

	// This is just for typing purposes
	public get manager(): ClientManager {
		return this;
	}

}
