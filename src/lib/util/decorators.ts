import { Message, Permissions, PermissionsResolvable, Piece, PieceConstructor, PieceOptions } from '@klasa/core';
import { ChannelType } from '@klasa/dapi-types';
import { isFunction } from '@klasa/utils';
import type { CustomResolverFunction } from '@lib/types/interfaces';
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

export function createClassDecorator<TFunction extends(...args: any[]) => void>(fn: TFunction): ClassDecorator {
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

export function mergeOptions<T extends PieceOptions>(optionsOrFunction: T | ((client: KlasaClient) => T)): ClassDecorator {
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

export function createResolvers(resolvers: [string, CustomResolverFunction][]): ClassDecorator {
	return createClassDecorator((target: PieceConstructor<Command>): PieceConstructor<Command> => createProxy(target, {
		construct: (ctor, [store, directory, files, options]): Command => {
			const command = new ctor(store, directory, files, options);
			for (const resolver of resolvers) command.createCustomResolver(...resolver);
			return command;
		}
	}));
}

export function createResolver(...args: [string, CustomResolverFunction]): ClassDecorator {
	return createResolvers([args]);
}

export function customizeResponses(responses: [string, string | ((message: Message) => string)][]): ClassDecorator {
	return createClassDecorator((target: PieceConstructor<Command>): PieceConstructor<Command> => createProxy(target, {
		construct: (ctor, [store, directory, files, options]): Command => {
			const command = new ctor(store, directory, files, options);
			for (const response of responses) command.customizeResponse(...response);
			return command;
		}
	}));
}

export function customizeResponse(...args: [string, string | ((message: Message) => string)]): ClassDecorator {
	return customizeResponses([args]);
}

// eslint-disable-next-line max-statements-per-line
export function requiresPermission(value: number, fallback: Fallback = (): undefined => undefined): MethodDecorator {
	return createFunctionInhibitor((message: Message): Promise<boolean> => message.hasAtLeastPermissionLevel(value), fallback);
}

export function requiresGuildContext(fallback: Fallback = (): undefined => undefined): MethodDecorator {
	return createFunctionInhibitor((message: Message): boolean => message.guild !== null, fallback);
}

export function requiresDMContext(fallback: Fallback = (): undefined => undefined): MethodDecorator {
	return createFunctionInhibitor((message: Message): boolean => message.guild === null, fallback);
}

export function requiredPermissions(permissionsResolvable: PermissionsResolvable, fallback: Fallback = (): undefined => undefined): MethodDecorator {
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
