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

	public create(type: WorkerTypes): void {
		if (this.#destroyed) throw new Error('Workers cannot be created from a destroyed WorkerManager');
		const worker = new Worker(WorkerManager.kWorkerPath, { workerData: { type } });
		worker.once('exit', (exitCode): void => {
			this.client.console.log(`[${WorkerManager.normalizeType(type)}] :: Exited with code ${exitCode} :: Respawning...`);
			worker.removeAllListeners();
			this.create(type);
		});
		worker.on('message', this._handleMessage.bind(this, type));
	}

	public init(): Promise<void> {
		return new Promise((resolve): void => {
			process.nextTick((): void => resolve());
		});
	}

	public async destroy(): Promise<void> {
		this.#destroyed = true;
		return new Promise((resolve): void => {
			process.nextTick((): void => resolve());
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
	public sendToWorker(type: WorkerTypes, message: WorkerPayload): void { }

	private _handleMessage(type: WorkerTypes, payload: MasterPayload): void {
		const normalized = WorkerManager.normalizeType(type);
		switch (payload.event) {
			case WorkerOpCodes.Ready:
				this.client.console.log(`[${normalized}] :: Ready`);
				break;
			case WorkerOpCodes.Heartbeat:
				this.client.console.log(`[${normalized}] :: Heartbeat received`);
				this.sendToWorker(type, { event: WorkerOpCodes.Ack });
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
