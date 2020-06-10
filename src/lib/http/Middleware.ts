import { Piece, PieceOptions } from '@klasa/core';
import { mergeDefault } from '@klasa/utils';
import type { StarlightIncomingMessage as IncomingMessage } from '@http/StarlightIncomingMessage';
import type { MiddlewareStore } from '@http/MiddlewareStore';
import type { Route } from '@http/Route';
import type { StarlightServerResponse as ServerResponse } from '@http/StarlightServerResponse';

export abstract class Middleware extends Piece {

	public priority: number;

	public constructor(store: MiddlewareStore, directory: string, files: readonly string[], options: MiddlewareOptions = {}) {
		super(store, directory, files, mergeDefault({ enabled: true }, options));
		this.priority = options.priority!;
	}

	public abstract run(request: IncomingMessage, response: ServerResponse, route: Route): void | Promise<void>;

}

export interface MiddlewareOptions extends PieceOptions {
	priority?: number;
}
