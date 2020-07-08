import type { IdKeyed } from "@klasa/request-handler";
import { UpdateManager } from "@orm/utilities/UpdateManager";
import { BaseEntity } from "typeorm";

export abstract class BaseID extends BaseEntity implements IdKeyed<string> {
	public abstract id: string;

	public constructor(data: Partial<BaseID> = {}) {
		super();
		Object.assign(this, data);
	}

	public update(cb: (entity: this) => void): Promise<this> {
		const manager = UpdateManager.acquire(this);
		return manager.add(cb);
	}

}
