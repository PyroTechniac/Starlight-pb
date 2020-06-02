import { Cache } from '@klasa/cache';
import { KlasaClient, Schema, SchemaEntry, SettingsFolder } from 'klasa';
import { Guild, Client } from '@klasa/core';
import { toTitleCase } from '@klasa/utils';

import type { StarlightPlugin } from '../client/StarlightPlugin';

export class SchemaManager implements StarlightPlugin {

	#configurable: Cache<string, Schema | SchemaEntry> = new Cache(); // eslint-disable-line @typescript-eslint/explicit-member-accessibility

	public constructor(public readonly client: KlasaClient) { }

	public initAll(): void {
		for (const [name, { schema }] of this.client.gateways) {
			if (this.init(name, schema)) this.#configurable.set(`${name}/${schema.path}`, schema);
		}
	}

	public get(prefix: string, path: string): Schema | SchemaEntry | undefined {
		return this.#configurable.get(`${prefix}/${path}`);
	}

	public *values(): IterableIterator<SchemaEntry | Schema> {
		yield *this.#configurable.values();
	}

	public *entries(): IterableIterator<[string, SchemaEntry | Schema]> {
		yield *this.#configurable.entries();
	}

	public *keys(): IterableIterator<string> {
		yield *this.#configurable.keys();
	}

	public displayFolder(prefix: string, settings: SettingsFolder): string {
		const array: string[] = [];
		const folders: string[] = [];
		const sections = new Map<string, string[]>();
		let longest = 0;
		const guild = (settings.base?.target instanceof Guild ? settings.base.target : null) ?? null;

		for (const [key, value] of settings.schema.entries()) {
			if (!this.#configurable.has(`${prefix}/${value.path}`)) continue;

			if (Schema.is(value)) {
				folders.push(`// ${key}`);
			} else {
				const values = sections.get(value.type) ?? [];
				values.push(key);

				if (key.length > longest) longest = key.length;
				if (values.length === 1) sections.set(value.type, values);
			}
		}

		if (folders.length) array.push('= Folders =', ...folders.sort(), '');
		if (sections.size) {
			for (const keyType of [...sections.keys()].sort()) {
				array.push(`= ${toTitleCase(keyType)}s =`,
					...sections.get(keyType)!.sort().map((key): string => `${key.padEnd(longest)} :: ${this.displayEntry(settings.schema.get(key) as SchemaEntry, settings.get(key), guild)}`),
					'');
			}
		}

		return array.join('\n');
	}

	public *[Symbol.iterator](): IterableIterator<[string, SchemaEntry | Schema]> {
		yield *this.#configurable;
	}

	public displayEntry(entry: SchemaEntry, value: unknown, guild: Guild | null = null): string {
		return entry.array
			? this.displayEntryMultiple(entry, value as readonly unknown[], guild)
			: this.displayEntrySingle(entry, value, guild);
	}

	private displayEntryMultiple(entry: SchemaEntry, values: readonly unknown[], guild: Guild | null): string {
		return values.length === 0
			? 'None'
			: `[ ${values.map((val): string => this.displayEntrySingle(entry, val, guild)).join(' | ')} ]`;
	}

	private displayEntrySingle(entry: SchemaEntry, value: unknown, guild: Guild | null): string {
		return entry.serializer!.stringify(value, guild) || 'Not set';
	}

	private init(prefix: string, schema: Schema): boolean {
		const previous = this.filteredKeys(prefix).size;

		for (const value of schema.values()) {
			if (Schema.is(value)) {
				if (this.init(prefix, value)) this.#configurable.set(`${prefix}/${value.path}`, value);
			} else if (value.configurable) {
				this.#configurable.set(`${prefix}/${value.path}`, value);
			}
		}

		return previous !== this.filteredKeys(prefix).size;
	}

	private filteredKeys(prefix: string): Cache<string, Schema | SchemaEntry> {
		return this.#configurable.filter((_, key): boolean => key.startsWith(prefix));
	}

	public static [Client.plugin](this: Client): void {
		this.schemas = new SchemaManager(this as KlasaClient);
	}

}