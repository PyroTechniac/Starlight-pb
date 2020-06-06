import type { Client } from '@klasa/core';
import { IncomingMessage as Base } from 'http';
import { parse } from 'url';
import { HTTPUtils } from '../util/utils';
import type { Route } from './Route';
import type { StarlightServerResponse as ServerResponse } from './StarlightServerResponse';
import split = HTTPUtils.split;

export class StarlightIncomingMessage extends Base {

	public originalUrl: string | null = null;

	public path: string | null = null;

	public search: string | null = null;

	public query: any = null;

	public params: any = null;

	public route: Route | null = null;

	public auth: any = null;

	public body: any = null;

	public get methodLower(): string {
		return constants.METHODS_LOWER[this.method!]; // eslint-disable-line @typescript-eslint/no-use-before-define
	}

	public execute(response: ServerResponse): void {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return this.route[this.methodLower]?.(this, response); // eslint-disable-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
	}

	protected _init(client: Client): void {
		const info = parse(this.url!, true);
		this.originalUrl = this.originalUrl || this.url!;
		this.path = info.pathname;
		this.search = info.search;
		this.query = info.query;

		const splitURL = split(this.path!);
		this.route = client.routes.findRoute(this.method!, splitURL) ?? null;

		if (this.route) this.params = this.route.execute(splitURL);
	}

}

import { HTTPConstants as constants } from '../util/constants';
