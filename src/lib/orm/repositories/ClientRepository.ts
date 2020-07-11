import { Client, Piece, Structure } from '@klasa/core';
import { ClientEntity } from '@orm/entities/ClientEntity';
import { BaseRepository } from '@orm/repositories/base/BaseRepository';
import { toss } from '@utils/util';
import { EntityRepository } from 'typeorm';

export type ClientEntityResolvable = string | Client | Structure<Client> | Piece;

@EntityRepository(ClientEntity)
export class ClientRepository extends BaseRepository<ClientEntity, ClientEntityResolvable> {

	public createOne(id: string): Promise<ClientEntity> {
		const entity = new ClientEntity();
		entity.id = id;
		return this.save(entity);
	}

	public createMany(ids: readonly string[]): Promise<ClientEntity[]> {
		return this.manager.transaction((manager): Promise<ClientEntity[]> => {
			const entities = [];
			for (const id of ids) {
				const entity = new ClientEntity();
				entity.id = id;
				entities.push(entity);
			}
			return manager.save(entities);
		});
	}

	public resolveToID(resolvable: ClientEntityResolvable): string {
		if (resolvable instanceof Structure || resolvable instanceof Piece) return this.resolveToID(resolvable.client);
		return typeof resolvable === 'string' ? resolvable : resolvable.user?.id ?? toss(new Error('Cannot acquire ClientEntity from non-ready Client'));
	}

}
