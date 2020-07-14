import type { IdKeyed } from '@klasa/request-handler';
import { BaseEntity } from 'typeorm';
import type { Constructor } from '@klasa/core';

export type PrimitiveTypes = string | number | bigint;

export abstract class BaseID<K extends PrimitiveTypes = string> extends BaseEntity implements IdKeyed<K> {

	public abstract id: K;

	public clone(): this {
		const Ctor = this.constructor as Constructor<this>;
		const clone = new Ctor();
		Object.assign(clone, this);
		return clone;
	}

}
