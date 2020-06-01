import type { PieceOptions, PieceConstructor, Piece, Store } from '@klasa/core';

/* eslint-disable @typescript-eslint/ban-types */

export function createClassDecorator(fn: Function): Function {
	return fn;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ApplyOptions<T extends PieceOptions>(options: T): Function {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	return createClassDecorator((Target: PieceConstructor<Piece>): PieceConstructor<Piece> => class extends Target {

		public constructor(store: Store<Piece>, directory: string, files: readonly string[]) {
			super(store, directory, files, options);
		}

	});
}
