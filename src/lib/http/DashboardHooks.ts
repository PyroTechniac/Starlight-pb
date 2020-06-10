import { Client, ClientEvents, DataStore, Constructor } from '@klasa/core';
import { createServer, Server, STATUS_CODES } from 'http';
import type { StarlightIncomingMessage as IncomingMessage } from '@http/StarlightIncomingMessage';
import type { StarlightServerResponse as ServerResponse } from '@http/StarlightServerResponse';
import type { StarlightPlugin } from '@client/StarlightPlugin';
import { HTTPConstants } from '@utils/constants';
import { mergeDefault } from '@klasa/utils';
import OPTIONS = HTTPConstants.OPTIONS;
import { RouteStore } from '@http/RouteStore';
import { MiddlewareStore } from '@http/MiddlewareStore';
import { join } from 'path';
import { StarlightEvents } from '@lib/types/enums';
import { DashboardUser } from '@http/DashboardUser';

interface ErrorLike {
	code?: number;
	status?: number;
	statusCode?: number;
	message?: string;
}

export class DashboardHooks implements StarlightPlugin {

	public server: Server;

	private onNoMatch: (this: DashboardHooks, _request: IncomingMessage, response: ServerResponse) => void;

	public constructor(public readonly client: Client) {
		const { serverOptions } = client.options.hooks;

		this.server = createServer(serverOptions);

		this.onNoMatch = this.onError.bind(this, { code: 404 });
	}

	public listen(port: number): Promise<void> {
		this.server.on('request', this.handler.bind(this));
		return new Promise((resolve): void => {
			this.server.listen(port, resolve);
		});
	}

	private async handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
		// eslint-disable-next-line
		request['_init'](this.client);

		try {
			await this.client.middlewares.run(request, response, request.route!);
			await (request.route ? request.execute(response) : this.onNoMatch(request, response));
			this.client.emit(StarlightEvents.Log, `Route hit: [${request.method}]-/${request.route?.route ?? null}`);
		} catch (err) {
			this.client.emit(ClientEvents.Error, err);
			this.onError(err, request, response);
		}
	}

	private onError(error: Error | ErrorLike, _request: IncomingMessage, response: ServerResponse): void {
		const code = (error as ErrorLike).code || (error as ErrorLike).status || (error as ErrorLike).statusCode || 500;
		if (response.writableFinished) return;
		response.error(error.message ?? STATUS_CODES[code]!);
	}

	public static [Client.plugin](this: Client): void {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		mergeDefault(OPTIONS, this.options);

		this.hooks = new DashboardHooks(this);

		this.routes = new RouteStore(this);

		this.middlewares = new MiddlewareStore(this);

		this.dashboardUsers = new DataStore(this, DashboardUser as unknown as Constructor<DashboardUser>, this.options.cache.limits.dashboardUsers ?? Infinity);

		const coreDirectory = join(__dirname, '../');
		for (const store of ['routes', 'middlewares'] as const) this[store].registerCoreDirectory(coreDirectory);

		this.hooks.listen(this.options.hooks.port)
			.catch(this.emit.bind(this, ClientEvents.WTF));
	}

}
