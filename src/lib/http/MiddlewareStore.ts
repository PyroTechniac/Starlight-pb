import { Client, PieceConstructor, Store } from '@klasa/core';
import type { StarlightIncomingMessage as IncomingMessage } from '@http/StarlightIncomingMessage';
import { Middleware } from '@http/Middleware';
import type { Route } from '@http/Route';
import type { StarlightServerResponse as ServerResponse } from '@http/StarlightServerResponse';

export class MiddlewareStore extends Store<Middleware> {

	public sortedMiddlewares: Middleware[] = [];

	public constructor(client: Client) {
		super(client, 'middlewares', Middleware as unknown as PieceConstructor<Middleware>);

		this.client.registerStore(this);
	}

	public clear(): void {
		this.sortedMiddlewares = [];
		return super.clear();
	}

	public add(piece: Middleware): Middleware | null {
		const middleware = super.add(piece);
		if (!middleware) return null;

		const index = this.sortedMiddlewares.findIndex((mid): boolean => mid.priority >= middleware.priority);
		if (index === -1) this.sortedMiddlewares.push(middleware);
		else this.sortedMiddlewares.splice(index, 0, middleware);
		return middleware;
	}

	public remove(name: Middleware | string): boolean {
		const middleware = this.resolve(name);
		if (!middleware) return false;
		this.sortedMiddlewares.splice(this.sortedMiddlewares.indexOf(middleware), 1);
		return super.remove(middleware);
	}

	public async run(request: IncomingMessage, response: ServerResponse, route: Route): Promise<void> {
		for (const middleware of this.sortedMiddlewares) {
			if (response.finished) return;
			if (middleware.enabled) await middleware.run(request, response, route);
		}
	}

}
