import { Piece, PieceOptions } from '@klasa/core';
import { promises as fsp } from 'fs';
import { noop } from '../util/utils';
import { join } from 'path';
import { rootFolder } from '../util/constants';
import readFile = fsp.readFile;

import type { AssetStore } from './AssetStore';
import type { File } from '@klasa/rest';

export abstract class Asset extends Piece {

	public filename: string;

	public filepath: string;

	#raw: null | Buffer = null;

	#initialized = false;

	public constructor(store: AssetStore, directory: string, files: readonly string[], options: AssetOptions = {}) {
		super(store, directory, files, options);

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
		}
	}

	public async init(): Promise<void> {
		this.#initialized = true;
		this.#raw = await readFile(this.filepath).catch(noop);
	}

	public toJSON(): object {
		return {
			...super.toJSON(),
			filepath: this.filepath,
			filename: this.filename,
			file: this.#raw
		};
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
