export const enum WorkerOpCodes {
	Ready,
	Heartbeat,
	Ack,
	Log
}

export const enum WorkerTypes {}

export interface BasePayload {
	event: WorkerOpCodes;
	data?: unknown;
}

export type MasterPayload = ReadyPayload | HeartbeatPayload

export interface ReadyPayload extends BasePayload {
	event: WorkerOpCodes.Ready;
	data?: never;
}

export interface HeartbeatPayload extends BasePayload {
	event: WorkerOpCodes.Heartbeat;
}

export interface LogPayload extends BasePayload {
	event: WorkerOpCodes.Log,
	data: any;
}

export type WorkerPayload = AckPayload;

export interface AckPayload extends BasePayload {
	event: WorkerOpCodes.Ack;
}