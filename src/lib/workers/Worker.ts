import { parentPort, isMainThread, MessagePort } from 'worker_threads';
import { EventIterator } from '@klasa/event-iterator';
import { MasterPayload, WorkerPayload, WorkerOpCodes } from '../types/worker';
import { TimerManager } from '@klasa/timer-manager';

class WorkerManager {

	/* eslint-disable @typescript-eslint/explicit-member-accessibility */
	#timer: NodeJS.Timer | null = null;

	#acked = false;
	/* eslint-enable @typescript-eslint/explicit-member-accessibility */

	private constructor() {
		this.checkMainThread(parentPort);
		this.sendToMaster({ event: WorkerOpCodes.Ready });
	}

	private sendToMaster(event: MasterPayload): void {
		return parentPort?.postMessage(event);
	}

	private handleTimer(): void {
		if (!this.#acked) throw new Error('Didn\'t receive ack before sending heartbeat, terminating...');
		this.sendToMaster({ event: WorkerOpCodes.Heartbeat });
		this.#acked = false;
	}

	private checkMainThread(port: unknown): asserts port is MessagePort {
		if (isMainThread || port === null) throw new Error('The Worker can only be spawned via the worker_threads fork method');
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	private async handlePayload(payload: WorkerPayload): Promise<void> {
		switch (payload.event) {
			case WorkerOpCodes.Identify: {
				this.#acked = true;
				this.#timer = TimerManager.setInterval(this.handleTimer.bind(this), 45000);
				break;
			}
			case WorkerOpCodes.Ack: {
				this.#acked = true;
				break;
			}
			default: {
				throw new Error(`Unknown payload received: ${JSON.stringify(payload)}`);
			}
		}
	}

	private static manager: WorkerManager;

	public static start(): void {
		this.main()
			.catch((err): void => {
				this.manager.sendToMaster({ event: WorkerOpCodes.Error, data: String(err) });
				if (this.manager.#timer !== null) {
					TimerManager.clearInterval(this.manager.#timer);
					this.manager.#timer = null;
				}
				process.exit(1);
			});
	}

	private static async main(): Promise<void> {
		this.manager = new WorkerManager();

		for await (const [payload] of new EventIterator<[WorkerPayload]>(parentPort!, 'message')) await this.manager.handlePayload(payload);
	}

}

WorkerManager.start();
