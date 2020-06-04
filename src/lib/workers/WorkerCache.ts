import { Client, ClientEvents } from '@klasa/core';
import { join } from 'path';
import { Worker } from 'worker_threads';
import { StarlightPlugin } from '../client/StarlightPlugin';
import { MasterPayload, WorkerOpCodes, WorkerPayload, WorkerTypes } from '../types/worker';

/* eslint-disable @typescript-eslint/naming-convention */
const WORKER_PATH = join(__dirname, 'Worker.js');

const UNRECOVERABLE_CLOSE_CODES = [
	1
];
/* eslint-enable @typescript-eslint/naming-convention */

export class WorkerCache extends Map<WorkerTypes, Worker> implements StarlightPlugin {

	#destroyed = false; // eslint-disable-line @typescript-eslint/explicit-member-accessibility

	public constructor(public readonly client: Client) {
		super();
	}

	public acquire(type: WorkerTypes): Worker {
		return this.get(type) ?? this.create(type);
	}

	public create(type: WorkerTypes): Worker {
		if (this.#destroyed) throw new Error('Cannot create workers with a destroyed WorkerCache');
		const worker = new Worker(WORKER_PATH);
		this.set(type, worker);
		worker.once('exit', (exitCode): void => this._onExit(type, exitCode));
		worker.on('message', (payload: MasterPayload): void => this._onPayload(type, payload));

		return worker;
	}

	public sendToWorker(type: WorkerTypes, payload: WorkerPayload): void {
		return this.get(type)?.postMessage(payload);
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	private _onExit(type: WorkerTypes, code: number): void {
		const shouldTerminate = UNRECOVERABLE_CLOSE_CODES.includes(code);
		this.client.console.warn(`[${WorkerCache.normalizeType(type)}] Exited with code ${code}, ${shouldTerminate ? 'terminating' : 'respawning'}...`);
		const worker = this.get(type);
		if (shouldTerminate) {
			worker?.terminate().catch((err): boolean => this.client.emit(ClientEvents.WTF, err));
			this.delete(type);
		} else {
			worker?.removeAllListeners();
			this.create(type);
		}
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	private _onPayload(type: WorkerTypes, payload: MasterPayload): void {
		const normalized = WorkerCache.normalizeType(type);
		switch (payload.event) {
			case WorkerOpCodes.Ready: {
				this.client.console.log(`[${normalized}] READY`);
				this.sendToWorker(type, { event: WorkerOpCodes.Identify, data: { type } });
				break;
			}
			case WorkerOpCodes.Error: {
				this.client.console.error(`[${normalized}] ${payload.data}`);
				break;
			}
			case WorkerOpCodes.Heartbeat: {
				this.client.console.debug(`[${normalized}] Heartbeat received`);
				this.sendToWorker(type, { event: WorkerOpCodes.Ack });
				break;
			}
			default: {
				this.client.console.warn(`[${normalized}] Unknown payload received: ${JSON.stringify(payload)}`);
				break;
			}
		}
	}

	public static normalizeType(type: WorkerTypes): string {
		switch (type) {
			default: return `Unknown Worker(${type})`;
		}
	}

	public static [Client.plugin](this: Client): void {
		this.workers = new WorkerCache(this);
	}

}
