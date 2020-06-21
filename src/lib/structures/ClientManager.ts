import { ContentDeliveryNetwork } from '@lib/structures/cdn/ContentDeliveryNetwork';
import { TypeORMEngine } from '@lib/structures/TypeORMEngine';
import type { ClientEngine } from '@lib/types/interfaces';
import type { KlasaClient } from 'klasa';

export class ClientManager implements ClientEngine {

	public typeORM: TypeORMEngine = new TypeORMEngine(this);

	public cdn: ContentDeliveryNetwork = new ContentDeliveryNetwork(this);

	public constructor(public readonly client: KlasaClient) {}

	// This is just for typing purposes
	public get manager(): ClientManager {
		return this;
	}

}
