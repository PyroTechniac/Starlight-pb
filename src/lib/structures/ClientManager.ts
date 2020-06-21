import type { ClientEngine } from '@lib/types/interfaces';
import type { KlasaClient } from 'klasa';
import { TypeORMEngine } from './TypeORMEngine';

export class ClientManager implements ClientEngine {

	public typeORM: TypeORMEngine = new TypeORMEngine(this); // eslint-disable-line @typescript-eslint/no-invalid-this

	public constructor(public readonly client: KlasaClient) {}

	// This is just for typing purposes
	public get manager(): ClientManager {
		return this;
	}

}
