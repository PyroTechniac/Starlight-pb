import type { ClientEngine } from "@lib/types/interfaces";
import type { KlasaClient } from "klasa";
import { SchemaEngine } from "@lib/structures/SchemaEngine";
import { TypeORMEngine } from "./TypeORMEngine";

export class ClientManager implements ClientEngine {
	public schemas: SchemaEngine = new SchemaEngine(this);

	public typeORM: TypeORMEngine = new TypeORMEngine(this);

	public constructor(public readonly client: KlasaClient) {}

	// This is just for typing purposes
	public get manager(): ClientManager {
		return this;
	}
}
