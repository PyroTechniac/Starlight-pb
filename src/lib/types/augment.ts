import type { AssetStore } from '@lib/structures/AssetStore';
import type { SchemaEngine } from '@lib/structures/SchemaEngine';
import type { TypeORMEngine } from '@lib/structures/TypeORMEngine';

declare module '@klasa/core/dist/src/lib/client/Client' {
	export interface Client {
		assets: AssetStore;
		schemas: SchemaEngine;
		typeORM: TypeORMEngine;
	}
}

declare module 'klasa/dist/src/lib/structures/Provider' {
	export interface Provider {
		readonly shouldUnload: boolean; // eslint-disable-line @typescript-eslint/naming-convention
	}
}
