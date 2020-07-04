import type { Message, Client } from '@klasa/core';
import type { Command, Possible } from 'klasa';
import type { ClientManager } from '@lib/structures/ClientManager';
import type { Inhibitor, Fallback } from '@utils/decorators';
import type { FetchTypes } from '@lib/types/types';
import type { RequestInit } from 'node-fetch';
import type { RequestHandler, IdKeyed } from '@klasa/request-handler';

export interface Resolvable<V> {
	resolve(): V | Promise<V>;
}
// Don't include editSettings (even though every conf command has one) because it's an implementation detail
export interface ConfCommand extends Command {
	show(message: Message, [key]: [string]): Promise<Message[]>;
	set(message: Message, [key, valueToSet]: [string, unknown]): Promise<Message[]>;
	remove(message: Message, [key, valueToRemove]: [string, unknown]): Promise<Message[]>;
	reset(message: Message, [key]: [string]): Promise<Message[]>;
}

export interface ClientEngine {
	readonly manager: ClientManager;
	readonly client: Client;
}

export interface CustomResolverFunction {
	(arg: any, possible: Possible, message: Message, additionalArgs: any[]): unknown;
}

export interface FunctionInhibitorMetadata {
	propertyKey: PropertyKey;
	inhibitor: Inhibitor;
	fallback: Fallback;
}

export interface ContentNodeJSON {
	url: string;
	createdAt: number;
	type: FetchTypes;
	options: RequestInit;
}

export interface Requestable<K, V extends IdKeyed<K>> {
	requestHandler: RequestHandler<K, V>;
	request(id: K): Promise<V>;
	requestMany(ids: readonly K[]): Promise<V[]>;
}

export interface BaseRepository<K, V extends IdKeyed<K>, Rs> {
	createHandler: RequestHandler<K, V>;
	acquire(resolvable: Rs): Promise<V>;
	createOne(id: K): Promise<V>;
	createMany(ids: readonly K[]): Promise<V[]>;
	resolveToID(resolvable: Rs): K;
}
