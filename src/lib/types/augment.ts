import type { AssetStore } from '@lib/structures/AssetStore';
import type { TypeORMEngine } from '@lib/structures/TypeORMEngine';
import type { ClientManager } from '@lib/structures/ClientManager';

declare module '@klasa/core/dist/src/lib/client/Client' {
	export interface Client {
		assets: AssetStore;
		readonly manager: ClientManager;
		readonly typeORM: TypeORMEngine;
	}
}

declare module 'klasa/dist/src/lib/structures/Provider' {
	export interface Provider {
		readonly shouldUnload: boolean; // eslint-disable-line @typescript-eslint/naming-convention
	}
}
