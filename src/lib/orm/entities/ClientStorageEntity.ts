import { BaseEntity, Entity, Index, Column } from "typeorm";
import type { Client } from "@klasa/core";
import { toss } from "@utils/util";

@Index('client_storage_pkey', ['id'], { unique: true })
@Entity('client_storage', { schema: 'public' })
export class ClientStorageEntity extends BaseEntity {
	@Column('varchar', { primary: true, length: 19 })
	public id: string = null!;

	@Column('int')
	public commandUses = 0;

	// Different from the other entities acquire because we'll only ever have to make one
	public static async acquire(raw: Client |  string): Promise<ClientStorageEntity> {
		const id = this.resolveToID(raw);
		try {
			return await this.findOneOrFail({ id });
		} catch {
			const entity = new ClientStorageEntity();
			entity.id = id;
			return this.save(entity);
		}
	}

	private static resolveToID(resolvable: Client | string): string {
		return typeof resolvable === 'string' ? resolvable : resolvable.user?.id ?? toss(new Error('Cannot acquire ClientEntity from non-ready Client'));
	}
}