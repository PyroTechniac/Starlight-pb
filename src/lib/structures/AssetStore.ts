import { Store, PieceConstructor, Client, ClientEvents } from '@klasa/core';
import { Asset } from './Asset';
import { scan, ensureDir } from 'fs-nextra';
import { extname } from 'path';

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
			for (const file of files) this.client.emit(ClientEvents.Error, `No Asset found for ${file}.`);
		}

		return super.init();
	}

}
