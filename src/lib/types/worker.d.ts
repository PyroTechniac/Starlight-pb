export const enum WorkerTypes {

}

export const enum WorkerOpCodes {
	Ready = 'ready',
	Identify = 'identify',
	Error = 'error',
	Heartbeat = 'heartbeat',
	Ack = 'ack'
}

export type MasterPayload = ReadyPayload | ErrorPayload | HeartbeatPayload;

export type WorkerPayload = IdentifyPayload | AckPayload;

interface BasePayload {
	event: WorkerOpCodes;
	data?: unknown;
}

export interface ReadyPayload extends BasePayload {
	event: WorkerOpCodes.Ready;
}

export interface ErrorPayload extends BasePayload {
	event: WorkerOpCodes.Error;
	data: string;
}

export interface HeartbeatPayload extends BasePayload {
	event: WorkerOpCodes.Heartbeat;
}

export interface IdentifyPayload extends BasePayload {
	event: WorkerOpCodes.Identify;
	data: {
		type: WorkerTypes;
	};
}

export interface AckPayload extends BasePayload {
	event: WorkerOpCodes.Ack;
}
