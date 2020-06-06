import type { Message } from '@klasa/core';
import type { ServerOptions } from 'http';
import type { Command } from 'klasa';

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

export interface ParsedPart {
	value: string;
	type: number;
}

export interface DashboardHooksOptions {
	apiPrefix?: string;
	origin?: string;
	port?: number;
	clientSecret?: string;
	clientID?: string;
	serverOptions?: ServerOptions;
}

export interface AuthData {
	token: string;
	scope: string[];
}
