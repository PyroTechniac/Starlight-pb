import type { IdKeyed } from "@klasa/request-handler";
import { UpdateManager } from "@orm/utilities/UpdateManager";
import { BaseEntity } from "typeorm";
import type { Constructor } from "@klasa/core";

export abstract class BaseID extends BaseEntity implements IdKeyed<string> {
	public abstract id: string;

	public update(cb: (entity: this) => void): Promise<this> {
		const manager = UpdateManager.acquire(this);
		return manager.add(cb)
			.then((): Promise<void> => this.reload())
			.then((): this => this);
	}

	public clone(): this {
		const Ctor = this.constructor as Constructor<this>;
		const clone = new Ctor();
		Object.assign(clone, this);
		return clone;
	}

	public async sync(): Promise<this> {
		await this.reload();
		return this;
	}
}
