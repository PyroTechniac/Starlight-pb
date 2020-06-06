import { Piece, PieceOptions } from '@klasa/core';
import { mergeDefault } from '@klasa/utils';
import type { ParsedRoute } from '../types/types';
import { HTTPUtils } from '../util/utils';
import type { StarlightIncomingMessage as IncomingMessage } from './StarlightIncomingMessage';
import type { RouteStore } from './RouteStore';
import type { StarlightServerResponse as ServerResponse } from './StarlightServerResponse';
import parse = HTTPUtils.parse;

export class Route extends Piece {

	public route: string;

	public authenticated: boolean;

	public parsed: ParsedRoute;

	public constructor(store: RouteStore, directory: string, files: readonly string[], options: RouteOptions = {}) {
		super(store, directory, files, mergeDefault({ enabled: true, authenticated: false }, options));

		this.route = this.client.options.hooks.apiPrefix + options.route!;
		this.authenticated = Boolean(options.authenticated);
		this.parsed = parse(this.route);
	}

	public matches(split: readonly string[]): boolean {
		if (split.length !== this.parsed.length) return false;
		for (let i = 0; i < this.parsed.length; i++) if (this.parsed[i]!.type === 0 && this.parsed[i]!.value !== split[i]) return false;
		return true;
	}

	public execute(split: readonly string[]): Record<string, string> {
		const params: Record<string, string> = {};
		for (let i = 0; i < this.parsed.length; i++) if (this.parsed[i]!.type === 1) params[this.parsed[i]!.value] = split[i]!;
		return params;
	}

}

export interface RouteOptions extends PieceOptions {
	route?: string;
	authenticated?: boolean;
}

export interface Route {
	readonly store: RouteStore;
	acl?(request: IncomingMessage, response: ServerResponse): unknown;
	bind?(request: IncomingMessage, response: ServerResponse): unknown;
	checkout?(request: IncomingMessage, response: ServerResponse): unknown;
	connect?(request: IncomingMessage, response: ServerResponse): unknown;
	copy?(request: IncomingMessage, response: ServerResponse): unknown;
	delete?(request: IncomingMessage, response: ServerResponse): unknown;
	get?(request: IncomingMessage, response: ServerResponse): unknown;
	head?(request: IncomingMessage, response: ServerResponse): unknown;
	link?(request: IncomingMessage, response: ServerResponse): unknown;
	lock?(request: IncomingMessage, response: ServerResponse): unknown;
	'm-search'?(request: IncomingMessage, response: ServerResponse): unknown;
	merge?(request: IncomingMessage, response: ServerResponse): unknown;
	mkactivity?(request: IncomingMessage, response: ServerResponse): unknown;
	mkcalendar?(request: IncomingMessage, response: ServerResponse): unknown;
	mkcol?(request: IncomingMessage, response: ServerResponse): unknown;
	move?(request: IncomingMessage, response: ServerResponse): unknown;
	notify?(request: IncomingMessage, response: ServerResponse): unknown;
	options?(request: IncomingMessage, response: ServerResponse): unknown;
	patch?(request: IncomingMessage, response: ServerResponse): unknown;
	post?(request: IncomingMessage, response: ServerResponse): unknown;
	propfind?(request: IncomingMessage, response: ServerResponse): unknown;
	proppatch?(request: IncomingMessage, response: ServerResponse): unknown;
	purge?(request: IncomingMessage, response: ServerResponse): unknown;
	put?(request: IncomingMessage, response: ServerResponse): unknown;
	rebind?(request: IncomingMessage, response: ServerResponse): unknown;
	report?(request: IncomingMessage, response: ServerResponse): unknown;
	search?(request: IncomingMessage, response: ServerResponse): unknown;
	source?(request: IncomingMessage, response: ServerResponse): unknown;
	subscribe?(request: IncomingMessage, response: ServerResponse): unknown;
	trace?(request: IncomingMessage, response: ServerResponse): unknown;
	unbind?(request: IncomingMessage, response: ServerResponse): unknown;
	unlink?(request: IncomingMessage, response: ServerResponse): unknown;
	unlock?(request: IncomingMessage, response: ServerResponse): unknown;
	unsubscribe?(request: IncomingMessage, response: ServerResponse): unknown;
}
