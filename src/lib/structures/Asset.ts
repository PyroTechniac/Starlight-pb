import { Attachment, Piece, PieceOptions } from '@klasa/core';
import type { File } from '@klasa/rest';
import { mergeDefault } from '@klasa/utils';
import { promises as fsp } from 'fs';
import { join } from 'path';
import type { Resolvable } from '@lib/types/interfaces';
import { rootFolder } from '@utils/constants';
import { noop } from '@utils/util';
import type { AssetStore } from '@lib/structures/AssetStore';
import readFile = fsp.readFile;

export abstract class Asset extends Piece implements Resolvable<File> {

	public filename: string;

	public filepath: string;

	/* eslint-disable @typescript-eslint/explicit-member-accessibility */
	#raw: null | Buffer = null;

	#initialized = false;
	/* eslint-enable @typescript-eslint/explicit-member-accessibility */

	public constructor(store: AssetStore, directory: string, files: readonly string[], options: AssetOptions = {}) {
		super(store, directory, files, mergeDefault({ enabled: true }, options));

		this.filename = options.filename ?? '';
		this.filepath = options.filepath ?? '';
	}

	public get attachment(): File {
		if (this.#raw === null) {
			throw new Error(this.#initialized ? 'Failed to load asset.' : 'Asset has not been loaded.');
		}

		return {
			name: this.filename,
			file: this.#raw
		};
	}

	public async resolve(): Promise<File> {
		return new Attachment({ name: this.filename, file: this.#raw ?? this.filepath }).resolve();
	}

	public async init(): Promise<void> {
		this.#initialized = true;
		this.#raw = await readFile(this.filepath).catch(noop);
	}

	public toJSON(): Record<string, unknown> {
		return {
			...super.toJSON(),
			filepath: this.filepath,
			filename: this.filename,
			file: this.#raw
		};
	}

	public static get basePath(): string {
		return this.makePath();
	}

	protected static makePath(...paths: readonly string[]): string {
		return join(rootFolder, 'assets', ...paths);
	}

}

export interface Asset {
	store: AssetStore;
}

export interface AssetOptions extends PieceOptions {
	filepath?: string;
	filename?: string;
}
