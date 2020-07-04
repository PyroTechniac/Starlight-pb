import { Client, Piece, Structure } from '@klasa/core';
import { Repository, EntityRepository } from 'typeorm';
import { ClientEntity } from '@orm/entities/ClientEntity';
import type { BaseRepository } from '@lib/types/interfaces';
import { toss } from '@utils/util';
import { RequestHandler } from '@klasa/request-handler';

export type ClientEntityResolvable = string | Client | Structure<Client> | Piece;

@EntityRepository(ClientEntity)
export class ClientRepository extends Repository<ClientEntity> implements BaseRepository<string, ClientEntity, ClientEntityResolvable> {

	public createHandler = new RequestHandler(
		this.createOne.bind(this),
		this.createMany.bind(this)
	);

	public async acquire(resolvable: ClientEntityResolvable): Promise<ClientEntity> {
		const id = this.resolveToID(resolvable);
		try {
			return await this.findOneOrFail({ id });
		} catch {
			return this.createHandler.push(id);
		}
	}

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
