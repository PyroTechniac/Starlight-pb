import { Provider, ReadonlyKeyedObject, SettingsUpdateResults } from 'klasa';
import { mergeObjects } from '@klasa/utils';

// This is a development provider for when file system access limited or unavailable to NodeJS
// It is in NO WAY meant for production, as it increases cache tremendously.
// However, this provider is the fastest of all, as it is pure JS, and doesn't query any external database.

/* eslint-disable @typescript-eslint/ban-types */

const enum ErrorMessages {
	TableExists = 'Table Exists',
	TableNotExists = 'Table Not Exists',
	EntryExists = 'Entry Exists',
	EntryNotExists = 'Entry Not Exists'
}

export default class extends Provider {

	#tables: Map<string, Map<string, object>> = new Map(); // eslint-disable-line @typescript-eslint/explicit-member-accessibility, @typescript-eslint/no-unsafe-assignment

	public create(table: string, entry: string, data: ReadonlyKeyedObject): Promise<void> {
		const resolvedTable = this.#tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));
		if (resolvedTable.has(entry)) return Promise.reject(new Error(ErrorMessages.EntryExists));
		const resolved = this.parseUpdateInput(data);
		resolvedTable.set(entry, { ...resolved, id: entry });
		return Promise.resolve();
	}

	public createTable(table: string): Promise<void> {
		if (this.#tables.has(table)) return Promise.reject(new Error(ErrorMessages.TableExists));
		this.#tables.set(table, new Map());
		return Promise.resolve();
	}

	public delete(table: string, entry: string): Promise<void> {
		const resolvedTable = this.#tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));
		if (!resolvedTable.has(entry)) return Promise.reject(new Error(ErrorMessages.EntryNotExists));
		resolvedTable.delete(entry);
		return Promise.resolve();
	}

	public deleteTable(table: string): Promise<void> {
		if (!this.#tables.has(table)) return Promise.reject(new Error(ErrorMessages.TableNotExists));
		this.#tables.delete(table);
		return Promise.resolve();
	}

	public get(table: string, entry: string): Promise<object | null> {
		const resolvedTable = this.#tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));
		return Promise.resolve(resolvedTable.get(entry) ?? null);
	}

	public getAll(table: string, entries?: readonly string[]): Promise<object[]> {
		const resolvedTable = this.#tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));
		if (typeof entries === 'undefined') {
			return Promise.resolve([...resolvedTable.values()]);
		}

		const values: object[] = [];
		for (const [key, value] of resolvedTable.entries()) {
			if (entries.includes(key)) values.push(value);
		}

		return Promise.resolve(values);
	}

	public getKeys(table: string): Promise<string[]> {
		const resolvedTable = this.#tables.get(table);
		return typeof resolvedTable === 'undefined'
			? Promise.reject(new Error(ErrorMessages.TableNotExists))
			: Promise.resolve([...resolvedTable.keys()]);
	}

	public has(table: string, entry: string): Promise<boolean> {
		const resolvedTable = this.#tables.get(table);
		return typeof resolvedTable === 'undefined'
			? Promise.reject(new Error(ErrorMessages.TableNotExists))
			: Promise.resolve(resolvedTable.has(entry));
	}

	public hasTable(table: string): Promise<boolean> {
		return Promise.resolve(this.#tables.has(table));
	}

	public init(): Promise<unknown> {
		if (this.shouldUnload) return Promise.resolve(this.unload());
		if (this.client.options.production) return Promise.reject(new Error('[PROVIDER] The cache provider is not meant for production.'));
		return Promise.resolve();
	}

	public replace(table: string, entry: string, data: ReadonlyKeyedObject | SettingsUpdateResults): Promise<void> {
		const resolvedTable = this.#tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));

		const resolvedEntry = resolvedTable.get(entry);
		if (typeof resolvedEntry === 'undefined') return Promise.reject(new Error(ErrorMessages.EntryNotExists));

		const resolved = this.parseUpdateInput(data);
		resolvedTable.set(entry, { ...resolved, id: entry });
		return Promise.resolve();
	}

	public update(table: string, entry: string, data: ReadonlyKeyedObject | SettingsUpdateResults): Promise<void> {
		const resolvedTable = this.#tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));

		const resolvedEntry = resolvedTable.get(entry);
		if (typeof resolvedEntry === 'undefined') return Promise.reject(new Error(ErrorMessages.EntryNotExists));

		const resolved = this.parseUpdateInput(data);
		const merged = mergeObjects({ ...resolvedEntry }, resolved);
		resolvedTable.set(entry, merged);

		return Promise.resolve();
	}

}
