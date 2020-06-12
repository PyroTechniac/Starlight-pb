import type { Constructor, Message, Piece, PieceConstructor, PieceOptions, Store } from '@klasa/core';
import { isFunction } from '@klasa/utils';
import { Extendable as KlasaExtendable, ExtendableOptions, ExtendableStore, ScheduledTask, ScheduledTaskOptions, Task, Command, CommandStore, CommandOptions } from 'klasa';
import { StarlightEvents } from '@lib/types/enums';
import type { CustomResolverFunction } from '@lib/types/interfaces';
/* eslint-disable @typescript-eslint/ban-types */

// #region Basic

export function createClassDecorator(fn: Function): Function {
	return fn;
}

export function createMethodDecorator(fn: MethodDecorator): MethodDecorator {
	return fn;
}

export function createFunctionInhibitor(inhibitor: Inhibitor, fallback: Fallback = (): undefined => undefined): MethodDecorator {
	return createMethodDecorator((_target, _propertyKey, descriptor): void => {
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

export function mergeOptions<T extends PieceOptions>(options: T): Function {
	return createClassDecorator((target: PieceConstructor<Piece>): PieceConstructor<Piece> => class extends target {

		public constructor(store: Store<Piece>, directory: string, files: readonly string[]) {
			super(store, directory, files, options);
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

// eslint-disable-next-line max-statements-per-line
export function requiresPermission(value: number, fallback: Fallback = (message: Message): never => { throw message.language.get('INHIBITOR_PERMISSIONS'); }): MethodDecorator {
	return createFunctionInhibitor((message: Message): Promise<boolean> => message.hasAtLeastPermissionLevel(value), fallback);
}

export function requiresGuildContext(fallback: Fallback = (): undefined => undefined): MethodDecorator {
	return createFunctionInhibitor((message: Message): boolean => message.guild !== null, fallback);
}

export function requiresDMContext(fallback: Fallback = (): undefined => undefined): MethodDecorator {
	return createFunctionInhibitor((message: Message): boolean => message.guild === null, fallback);
}

// #endregion Commands

// #region Tasks

// Here because TS doesn't like you extending abstract classes in decorators without implementing them
// And because you can't make a class returned by a decorator abstract
interface NonAbstractTask extends Task {
	run(data?: any): Promise<void>;
}

export function ensureTask(time: string | number | Date, data?: ScheduledTaskOptions): Function {
	return createClassDecorator((target: PieceConstructor<NonAbstractTask>): PieceConstructor<NonAbstractTask> => class extends target {

		private get scheduled(): ScheduledTask | undefined {
			return this.client.schedule.tasks.find((st): boolean => st.taskName === this.name && st.task === this);
		}

		public async init(): Promise<void> {
			await super.init();

			const { scheduled: found } = this;
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
