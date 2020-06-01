import { Piece, PieceOptions, Attachment } from '@klasa/core';
import { promises as fsp } from 'fs';
import { noop } from '../util/utils';
import { join } from 'path';
import { rootFolder } from '../util/constants';
import { mergeDefault } from '@klasa/utils';
import readFile = fsp.readFile;

import type { AssetStore } from './AssetStore';
import type { File } from '@klasa/rest';
import type { FileResolvable } from '../types/interfaces';

export abstract class Asset extends Piece implements FileResolvable {

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
