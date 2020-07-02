import { BaseEntity, Entity, Index, Column } from 'typeorm';
import { Client, Structure, Piece } from '@klasa/core';
import { toss } from '@utils/util';
import { RebootState } from '@orm/entities/RebootState';

export type ClientEntityResolvable = string | Client | Structure<Client> | Piece;

@Entity('client', { schema: 'public' })
export class ClientEntity extends BaseEntity {

	@Index('client_storage_pkey', { unique: true })
	@Column('varchar', { primary: true, length: 19 })
	public id: string = null!;

	@Column('int')
	public commandUses = 0;

	@Column((): typeof RebootState => RebootState)
	public rebootState: RebootState = new RebootState();

	// Different from the other entities acquire because we'll only ever have to make one
	public static async acquire(raw: ClientEntityResolvable): Promise<ClientEntity> {
		const id = this.resolveToID(raw);
		try {
			return await this.findOneOrFail({ id });
		} catch {
			const entity = new ClientEntity();
			entity.id = id;
			return this.save(entity);
		}
	}

	private static resolveToID(resolvable: ClientEntityResolvable): string {
		if (resolvable instanceof Structure || resolvable instanceof Piece) return this.resolveToID(resolvable.client);
		return typeof resolvable === 'string' ? resolvable : resolvable.user?.id ?? toss(new Error('Cannot acquire ClientEntity from non-ready Client'));
	}

}
