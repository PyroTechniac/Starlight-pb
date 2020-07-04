import 'module-alias/register';
import { parentPort, isMainThread, MessagePort } from 'worker_threads';
import { MasterPayload, WorkerOpCodes, WorkerPayload } from '@lib/types/workers';
import { TimerManager } from '@klasa/timer-manager';
import { EventIterator } from '@klasa/event-iterator';

class DataHandler {

	#timer: NodeJS.Timeout | null = null; // eslint-disable-line @typescript-eslint/explicit-member-accessibility

	private constructor() {
		this.checkParentPort(parentPort);
	}

	public destroy(code?: number): never {
		if (this.#timer) {
			TimerManager.clearInterval(this.#timer);
			this.#timer = null;
		}
		return process.exit(code);
	}

	private async init(): Promise<void> {
		this.sendToMaster({ event: WorkerOpCodes.Ready });
		this.#timer = TimerManager.setInterval((): void => {
			this.sendToMaster({ event: WorkerOpCodes.Heartbeat });
		}, 45000);
		for await (const [message] of new EventIterator<[WorkerPayload]>(parentPort!, 'message')) {
			this.handleMessage(message);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
	private handleMessage(data: WorkerPayload): void { }

	private sendToMaster(message: MasterPayload): void {
		parentPort?.postMessage(message);
	}

	private checkParentPort(port: unknown): asserts port is MessagePort {
		if (isMainThread || port === null) throw new TypeError('Data Handler can only be spawned from the Worker fork method.');
	}

	private static instance: DataHandler | null = null;

	public static async main(): Promise<void> {
		this.instance = new DataHandler();
		await this.instance.init();
	}

	public static destroy(): void {
		this.instance?.destroy();
	}

}

DataHandler.main()
	.catch((): void => {
		DataHandler.destroy();
	});
