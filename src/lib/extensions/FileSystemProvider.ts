import { ClientEvents, PieceOptions } from '@klasa/core';
import { chunk as chunkFn, mergeDefault, mergeObjects } from '@klasa/utils';
import { promises as fsp } from 'fs';
import * as fsn from 'fs-nextra';
import { Provider, ProviderStore } from 'klasa';
import { dirname, resolve } from 'path';

export abstract class FileSystemProvider extends Provider {

	public baseDirectory: string;

	public constructor(store: ProviderStore, directory: string, files: readonly string[], options: PieceOptions = {}) {
		super(store, directory, files, options);

		const baseDirectory = resolve(this.client.userBaseDirectory, 'bwd', 'provider', this.name);
		const defaults = mergeDefault({ baseDirectory }, this.client.options.providers[this.name] as { baseDirectory?: string });

		this.baseDirectory = defaults.baseDirectory;
	}

	public get extension(): string {
		return this.name;
	}

	public async init(): Promise<unknown> {
		if (this.shouldUnload) return this.unload();
		await fsn.ensureDir(this.baseDirectory).catch((err): boolean => this.client.emit(ClientEvents.WTF, err));
	}

	public hasTable(table: string): Promise<boolean> {
		return fsn.pathExists(this.resolve(table));
	}

	public createTable(table: string): Promise<void> {
		return fsn.mkdirs(this.resolve(table));
	}

	public async deleteTable(table: string): Promise<void | null> { // eslint-disable-line @typescript-eslint/no-invalid-void-type
		const exists = await this.hasTable(table);
		const resolvedTable = this.resolve(table);
		return exists ? fsn.emptyDir(resolvedTable).then((): Promise<void> => fsn.remove(resolvedTable)) : null;
	}

	public async getAll(table: string, entries?: string[]): Promise<unknown[]> {
		if (!Array.isArray(entries) || !entries.length) entries = await this.getKeys(table);
		if (entries.length < 5000) {
			return Promise.all(entries.map(this.get.bind(this, table)));
		}

		const output = [];
		for (const chunk of chunkFn(entries, 5000)) output.push(...await Promise.all(chunk.map(this.get.bind(this, table))));
		return output;
	}

	public async get(table: string, id: string): Promise<unknown> {
		try {
			return await this.read(this.resolve(table, id));
		} catch {
			return null;
		}
	}

	public create(table: string, id: string, data: object = {}): Promise<unknown> { // eslint-disable-line @typescript-eslint/ban-types
		return this.write(this.resolve(table, id), { id, ...this.parseUpdateInput(data) });
	}

	public async update(table: string, id: string, data: object): Promise<unknown> { // eslint-disable-line @typescript-eslint/ban-types
		const existent = await this.get(table, id) as Record<PropertyKey, unknown> | null;
		const parsedData = this.parseUpdateInput(data);
		return this.write(this.resolve(table, id), mergeObjects(existent ?? { id }, parsedData));
	}

	public replace(table: string, id: string, data: object): Promise<unknown> { // eslint-disable-line @typescript-eslint/ban-types
		return this.write(this.resolve(table, id), { id, ...this.parseUpdateInput(data) });
	}

	public async getKeys(table: string): Promise<string[]> {
		const extension = `.${this.extension}`;
		const raw = await fsp.readdir(this.resolve(table));
		const files: string[] = [];
		for (const filename of raw) {
			if (!filename.endsWith(extension)) continue;
			files.push(filename.slice(0, filename.length - extension.length));
		}

		return files;
	}

	public has(table: string, id: string): Promise<boolean> {
		return fsn.pathExists(this.resolve(table, id));
	}

	public delete(table: string, id: string): Promise<void> {
		return fsp.unlink(this.resolve(table, id));
	}

	public async backup(file: string): Promise<void> {
		await fsn.ensureDir(dirname(file));
		await fsn.targz(file, this.baseDirectory);
	}

	public abstract read(file: string): Promise<unknown>;

	public abstract write(file: string, data: object): Promise<unknown>; // eslint-disable-line @typescript-eslint/ban-types

	protected resolve(table: string, id?: string): string {
		return id ? resolve(this.baseDirectory, table, `${id}.${this.extension}`) : resolve(this.baseDirectory, table);
	}

}
