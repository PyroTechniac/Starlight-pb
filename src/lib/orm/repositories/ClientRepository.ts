import { ClientStorage } from "@orm/entities/ClientStorage";
import { BaseRepository } from '@orm/repositories/BaseRepository';
import { EntityRepository } from "typeorm";

@EntityRepository(ClientStorage)
export class ClientRepository extends BaseRepository<ClientStorage> {
	public findById(id: string): Promise<ClientStorage | undefined> {
		return this.findOne({ id });
	}

	public createAndSave(id: string): Promise<ClientStorage> {
		return this.save(this.create({ id }));
	}
}