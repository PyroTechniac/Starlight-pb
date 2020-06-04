import { Client, ClientEvents, PieceConstructor, Store } from '@klasa/core';
import { ensureDir, scan } from 'fs-nextra';
import { extname } from 'path';
import { Asset } from './Asset';
import { StarlightEvents } from '../types/enums';

export class AssetStore extends Store<Asset> {

	public constructor(client: Client) {
		super(client, 'assets', Asset as unknown as PieceConstructor<Asset>);

		this.client.registerStore(this);
	}

	private get filepaths(): string[] {
		return this.map((asset): string => asset.filepath);
	}

	public async init(): Promise<any[]> {
		const { filepaths } = this;

		const { basePath } = Asset;

		const files = await scan(basePath, {
			filter: (dirent, path): boolean => dirent.isFile() && ['.webp', '.png', '.jpg', '.gif'].includes(extname(path))
		})
			.then((f): string[] => [...f.keys()].filter((path): boolean => !filepaths.includes(path)))
			.catch(() => ensureDir(basePath).catch((err): void => { this.client.emit(ClientEvents.Error, err); }));

		if (!files) return super.init();

		if (files.length) {
			for (const file of files) this.client.emit(StarlightEvents.Warn, `No Asset found for ${file}.`);
		}

		return super.init();
	}

}
