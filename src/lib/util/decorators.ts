import type { Constructor, Message, Piece, PieceConstructor, PieceOptions, Store } from '@klasa/core';
import { isFunction } from '@klasa/utils';
import { Extendable as KlasaExtendable, ExtendableOptions, ExtendableStore, ScheduledTask, ScheduledTaskOptions, Task } from 'klasa';
import { StarlightEvents } from '../types/enums';
import type { Route, RouteOptions } from '../http/Route';
import { RouteStore } from '../http/RouteStore';
import { RateLimitManager } from '@klasa/ratelimits';
import type { StarlightIncomingMessage } from '../http/StarlightIncomingMessage';
import type { StarlightServerResponse } from '../http/StarlightServerResponse';
import { HTTPUtils } from './utils';
/* eslint-disable @typescript-eslint/ban-types */

export function createClassDecorator(fn: Function): Function {
	return fn;
}

export function createMethodDecorator(fn: MethodDecorator): MethodDecorator {
	return fn;
}

export function mergeOptions<T extends PieceOptions>(options: T): Function {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	return createClassDecorator((target: PieceConstructor<Piece>): PieceConstructor<Piece> => class extends target {

		public constructor(store: Store<Piece>, directory: string, files: readonly string[]) {
			super(store, directory, files, options);
		}

	}) as unknown as PieceConstructor<Piece>;
}

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

export function setRoute(route: string): Function {
	return createClassDecorator((target: PieceConstructor<Route>): PieceConstructor<Route> => class extends target {

		public constructor(store: RouteStore, directory: string, files: readonly string[], options: Omit<RouteOptions, 'route'> = {}) {
			super(store, directory, files, { ...options, route } as RouteOptions);
		}

	} as unknown as PieceConstructor<Route>);
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

// Not a Decorator, but a function that returns a class, so it's close enough.
export function Extendable(...appliesTo: any[]): Constructor<KlasaExtendable> { // eslint-disable-line @typescript-eslint/naming-convention
	return class extends KlasaExtendable {

		public constructor(store: ExtendableStore, directory: string, files: readonly string[], options: ExtendableOptions = {}) {
			super(store, directory, files, { ...options, appliesTo });
		}

	} as unknown as Constructor<KlasaExtendable>;
}

export function ratelimit(bucket: number, cooldown: number, auth = false): MethodDecorator {
	const manager = new RateLimitManager(bucket, cooldown);
	const xRateLimitLimit = bucket;
	return createFunctionInhibitor(
		(request: StarlightIncomingMessage, response: StarlightServerResponse): boolean => {
			const id = (auth ? request.auth.user_id as string : request.headers['x-forwarded-for'] as string || request.connection.remoteAddress!);
			const bucket = manager.acquire(id);

			response.setHeader('Date', new Date().toUTCString());
			if (bucket.limited) {
				response.setHeader('Retry-After', bucket.remainingTime.toString());
				return false;
			}

			try {
				bucket.drip();
			} catch { }

			response.setHeader('X-RateLimit-Limit', xRateLimitLimit);
			response.setHeader('X-RateLimit-Remaining', bucket.bucket.toString());
			response.setHeader('X-RateLimit-Reset', bucket.remainingTime.toString());

			return true;
		},
		(_request: StarlightIncomingMessage, response: StarlightServerResponse): void => response.error(429)
	);
}

export const authenticated = createFunctionInhibitor(
	(request: StarlightIncomingMessage): boolean => {
		if (!request.headers.authorization) return false;
		request.auth = HTTPUtils.decrypt(request.headers.authorization, process.env.CLIENT_SECRET!);
		return !(!request.auth.user_id || request.auth.token);
	},
	(_request: StarlightIncomingMessage, response: StarlightServerResponse): void => {
		response.error(403);
	}
);

export interface Inhibitor {
	(...args: any[]): boolean | Promise<boolean>;
}

export interface Fallback {
	(...args: any[]): unknown;
}
