import type { FunctionInhibitorMetadata } from '@lib/types/interfaces';

export class MetadataStorage<K, V> extends Map<K, V[]> {

	public add(target: K, value: V): this {
		const values = this.get(target) ?? [];
		values.push(value);
		return super.set(target, values);
	}

	public acquire(key: K): V[] {
		const values = this.get(key) ?? [];
		if (values.length === 0) this.set(key, values);
		return values;
	}

	public static functionInhibitors = new MetadataStorage<any, FunctionInhibitorMetadata>();

}
