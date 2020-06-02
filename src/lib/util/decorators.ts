import { ScheduledTask, ScheduledTaskOptions, Task, Extendable as KlasaExtendable, ExtendableStore, ExtendableOptions } from 'klasa';
import { StarlightEvents } from '../types/enums';

import type { Piece, PieceConstructor, PieceOptions, Store, Constructor } from '@klasa/core';
/* eslint-disable @typescript-eslint/ban-types */

export function createClassDecorator(fn: Function): Function {
	return fn;
}

export function mergeOptions<T extends PieceOptions>(options: T): Function {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	return createClassDecorator((target: PieceConstructor<Piece>): PieceConstructor<Piece> => class extends target {

		public constructor(store: Store<Piece>, directory: string, files: readonly string[]) {
			super(store, directory, files, options);
		}

	});
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

// Not a Decorator, but a function that returns a class, so it's close enough.
export function Extendable(...appliesTo: any[]): Constructor<KlasaExtendable> { // eslint-disable-line @typescript-eslint/naming-convention
	return class extends KlasaExtendable {

		public constructor(store: ExtendableStore, directory: string, files: readonly string[], options: ExtendableOptions = {}) {
			super(store, directory, files, { ...options, appliesTo });
		}

	} as unknown as Constructor<KlasaExtendable>;
}
