import { Client, ClientEvents, PieceConstructor, Store } from '@klasa/core';
import { ensureDir, scan } from 'fs-nextra';
import { Asset } from '@lib/structures/Asset';
import { StarlightEvents } from '@lib/types/enums';
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
			filter: (dirent, path): boolean => dirent.isFile() && AssetStore.kExtensionRegex.test(path)
		})
			.then((f): string[] => [...f.keys()].filter((file): boolean => !filepaths.includes(extname(file))))
			.catch((): Promise<string[]> => ensureDir(basePath)
				.then((): string[] => [])
				.catch(err => {
					this.client.emit(ClientEvents.Error, err);
					return [];
				}));

		if (files.length) {
			for (const file of files) this.client.emit(StarlightEvents.Warn, `No Asset found for ${file}.`);
		}

		return super.init();
	}

	private static kExtensionRegex = /\.(bmp|jpe?g|png|gif|webp)$/;

}
