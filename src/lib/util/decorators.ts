import { GuildTextBasedChannel, Message, Permissions, PermissionsFlags, PermissionsResolvable, Piece, PieceConstructor, PieceOptions } from '@klasa/core';
import { ChannelType } from '@klasa/dapi-types';
import { isFunction } from '@klasa/utils';
import type { CustomResolverFunction } from '@lib/types/interfaces';
import { friendlyPermissionNames } from '@utils/constants';
import { toss } from '@utils/util';
import type { Command, KlasaClient } from 'klasa';
/* eslint-disable @typescript-eslint/ban-types */

// #region Basic

export function createProxy<T extends object>(target: T, handler: Omit<ProxyHandler<T>, 'get'>): T {
	return new Proxy(target, {
		get: (target, prop): unknown => {
			const value = Reflect.get(target, prop);
			return typeof value === 'function' ? (...args: readonly unknown[]): unknown => value.apply(target, args) : value;
		},
		...handler
	});
}

export function createClassDecorator(fn: Function): Function {
	return fn;
}

export function createMethodDecorator(fn: MethodDecorator): MethodDecorator {
	return fn;
}

export function createFunctionInhibitor(inhibitor: Inhibitor, fallback: Fallback = (): undefined => undefined): MethodDecorator {
	return createMethodDecorator((target, propertyKey, descriptor): void => {
		const method = descriptor.value;
		if (!method) throw new Error('Function inhibitors require a [[value]].');
		if (!isFunction(method)) throw new Error('Function inhibitors can only be applied to functions.');

		descriptor.value = (async function descriptorValue(this: Function, ...args: any[]): Promise<any[]> {
			const canRun = await inhibitor(...args);
			return canRun ? method.call(this, ...args) : fallback.call(this, ...args); // eslint-disable-line @typescript-eslint/no-unsafe-return
		}) as unknown as undefined;
	});
}

// #endregion Basic

// #region Pieces

export function mergeOptions<T extends PieceOptions>(optionsOrFunction: T | ((client: KlasaClient) => T)): Function {
	return createClassDecorator((target: PieceConstructor<Piece>): PieceConstructor<Piece> => createProxy(target, {
		construct: (ctor, [store, directory, file, baseOptions = {}]): Piece => new ctor(store, directory, file, {
			...baseOptions, ...(typeof optionsOrFunction === 'function'
				? optionsOrFunction(store.client)
				: optionsOrFunction)
		})
	}));
}

// #endregion Pieces

// #region Commands

export function createResolvers(resolvers: [string, CustomResolverFunction][]): Function {
	return createClassDecorator((target: PieceConstructor<Command>): PieceConstructor<Command> => createProxy(target, {
		construct: (ctor, [store, directory, files, options]): Command => {
			const command = new ctor(store, directory, files, options);
			for (const resolver of resolvers) command.createCustomResolver(...resolver);
			return command;
		}
	}));
}

export function createResolver(...args: [string, CustomResolverFunction]): Function {
	return createResolvers([args]);
}

export function customizeResponses(responses: [string, string | ((message: Message) => string)][]): Function {
	return createClassDecorator((target: PieceConstructor<Command>): PieceConstructor<Command> => createProxy(target, {
		construct: (ctor, [store, directory, files, options]): Command => {
			const command = new ctor(store, directory, files, options);
			for (const response of responses) command.customizeResponse(...response);
			return command;
		}
	}));
}

export function customizeResponse(...args: [string, string | ((message: Message) => string)]): Function {
	return customizeResponses([args]);
}

// eslint-disable-next-line max-statements-per-line
export function requiresPermissionLevel(value: number, fallback: Fallback = (message: Message): never => toss(message.language.get('INHIBITOR_PERMISSIONS'))): MethodDecorator {
	return createFunctionInhibitor((message: Message): Promise<boolean> => message.hasAtLeastPermissionLevel(value), fallback);
}

export function requiresGuildContext(fallback: Fallback = (message: Message): never => toss(message.language.get('INHIBITOR_RUNIN', 'text'))): MethodDecorator {
	return createFunctionInhibitor((message: Message): boolean => message.guild !== null, fallback);
}

export function requiresDMContext(fallback: Fallback = (message: Message): never => toss(message.language.get('INHIBITOR_RUNIN', 'dm'))): MethodDecorator {
	return createFunctionInhibitor((message: Message): boolean => message.guild === null, fallback);
}

export function requiredPermissions(permissionsResolvable: PermissionsResolvable, fallback: Fallback = (message: Message): never => {
	const resolvedPermissions = Permissions.resolve(permissionsResolvable);
	const missing = (message.channel as GuildTextBasedChannel).permissionsFor(message.guild!.me!).missing(resolvedPermissions);
	throw message.language.get('INHIBITOR_MISSING_BOT_PERMS', missing.map((missing): string => friendlyPermissionNames[missing as PermissionsFlags]));
}): Function {
	const resolved = Permissions.resolve(permissionsResolvable);
	return createFunctionInhibitor(async (message: Message): Promise<boolean> => {
		const missing = message.channel.type === ChannelType.GuildText ? message.channel.permissionsFor(message.guild!.me ?? await message.guild!.members.fetch(message.client.user!.id)).missing(resolved) : [];
		return Boolean(missing.length);
	}, fallback);
}

// #endregion Commands

// #region Interfaces

export interface Inhibitor {
	(...args: any[]): boolean | Promise<boolean>;
}

export interface Fallback {
	(...args: any[]): unknown;
}

// #endregion Interfaces
