import { Constructor, Message, Piece, PieceConstructor, PieceOptions, Store, PermissionsResolvable, Permissions, PermissionsFlags, GuildTextBasedChannel } from '@klasa/core';
import { isFunction } from '@klasa/utils';
import { Extendable as KlasaExtendable, ExtendableOptions, ExtendableStore, ScheduledTask, ScheduledTaskOptions, Task, Command, CommandStore, CommandOptions, KlasaClient } from 'klasa';
import { StarlightEvents } from '@lib/types/enums';
import type { CustomResolverFunction } from '@lib/types/interfaces';
import { toss } from '@utils/util';
import { ChannelType } from '@klasa/dapi-types';
import { friendlyPermissionNames } from '@utils/constants';
/* eslint-disable @typescript-eslint/ban-types */

// #region Basic

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

export function mergeOptions<T extends PieceOptions>(options: T): Function;
// eslint-disable-next-line @typescript-eslint/unified-signatures
export function mergeOptions<T extends PieceOptions>(optionsFn: (client: KlasaClient) => T): Function;
export function mergeOptions<T extends PieceOptions>(optionsOrFunction: T | ((client: KlasaClient) => T)): Function {
	return createClassDecorator((target: PieceConstructor<Piece>): PieceConstructor<Piece> => class extends target {

		public constructor(store: Store<Piece>, directory: string, files: readonly string[], baseOptions: PieceOptions = {}) {
			const options = isFunction(optionsOrFunction) ? optionsOrFunction(store.client as KlasaClient) : optionsOrFunction;
			super(store, directory, files, { ...baseOptions, ...options });
		}

	});
}

// #endregion Pieces

// #region Commands

export function createResolvers(resolvers: [string, CustomResolverFunction][]): Function {

	return createClassDecorator((target: PieceConstructor<Command>): PieceConstructor<Command> => class extends target {

		public constructor(store: CommandStore, directory: string, files: readonly string[], options: CommandOptions) {
			super(store, directory, files, options);

			for (const resolver of resolvers) this.createCustomResolver(...resolver);
		}

	} as unknown as PieceConstructor<Command>);
}

export function createResolver(...args: [string, CustomResolverFunction]): Function {
	return createResolvers([args]);
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

// #region Tasks

// Here because TS doesn't like you extending abstract classes in decorators without implementing them
// And because you can't make a class returned by a decorator abstract
interface NonAbstractTask extends Task {
	run(data?: any): Promise<void>;
}

const kScheduled = Symbol('ScheduledTask');

export function ensureTask(time: string | number | Date, data?: ScheduledTaskOptions): Function {
	return createClassDecorator((target: PieceConstructor<NonAbstractTask>): PieceConstructor<NonAbstractTask> => class extends target {

		private get [kScheduled](): ScheduledTask | undefined {
			return this.client.schedule.tasks.find((st): boolean => st.taskName === this.name && st.task === this);
		}

		public async init(): Promise<void> {
			await super.init();

			const found = this[kScheduled];
			if (typeof found === 'undefined') {
				const created = await this.client.schedule.create(this.name, time, data);
				this.client.emit(StarlightEvents.TaskCreated, created!);
			} else {
				this.client.emit(StarlightEvents.TaskFound, found);
			}
		}

	});
}

// #endregion Tasks

// #region Interfaces

export interface Inhibitor {
	(...args: any[]): boolean | Promise<boolean>;
}

export interface Fallback {
	(...args: any[]): unknown;
}

// #endregion Interfaces

// #region Misc

// Not a Decorator, but a function that returns a class, so it's close enough.
export function Extendable(...appliesTo: any[]): Constructor<KlasaExtendable> { // eslint-disable-line @typescript-eslint/naming-convention
	return class extends KlasaExtendable {

		public constructor(store: ExtendableStore, directory: string, files: readonly string[], options: ExtendableOptions = {}) {
			super(store, directory, files, { ...options, appliesTo });
		}

	} as unknown as Constructor<KlasaExtendable>;
}

// #endregion Misc
