import type { Client } from '@klasa/core';
import type { ClientManager } from '@lib/structures/ClientManager';
import type { ClientEngine } from '@lib/types/interfaces';
import { MasterPayload, WorkerOpCodes, WorkerTypes, WorkerPayload } from '@lib/types/workers';
import { join } from 'path';
import { Worker } from 'worker_threads';

export class WorkerManager implements ClientEngine {

	#destroyed = false; // eslint-disable-line @typescript-eslint/explicit-member-accessibility

	public constructor(public readonly manager: ClientManager) { }

	public get client(): Client {
		return this.manager.client;
	}

	public create(type: WorkerTypes): Worker {
		if (this.#destroyed) throw new Error('Workers cannot be created from a destroyed WorkerManager');
		const worker = new Worker(WorkerManager.kWorkerPath, { workerData: { type } });
		worker.once('exit', (exitCode): void => {
			this.client.console.log(`[${WorkerManager.normalizeType(type)}] :: Exited with code ${exitCode} :: Respawning...`);
			worker.removeAllListeners();
			this.create(type);
		});
		worker.on('message', this._handleMessage.bind(this, type));
		return worker;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public sendToWorker(type: WorkerTypes, message: WorkerPayload): void {
		throw new Error('Unimplemented.');
	}

	private _handleMessage(type: WorkerTypes, payload: MasterPayload): void {
		const normalized = WorkerManager.normalizeType(type);
		switch (payload.event) {
			case WorkerOpCodes.Ready:
				this.client.console.log(`[${normalized}] :: Ready`);
				break;
			case WorkerOpCodes.Heartbeat:
				this.client.console.log(`[${normalized}] :: Heartbeat received`);
				break;
		}
	}

	private static readonly kWorkerPath = join(__dirname, 'DataHandler.js');

	public static normalizeType(type: WorkerTypes): string {
		switch (type) {
			default: return 'Unknown Worker';
		}
	}

}
