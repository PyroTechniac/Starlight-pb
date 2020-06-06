import { METHODS } from 'http';
import { join } from 'path';
import { StarlightIncomingMessage as IncomingMessage } from '../http/StarlightIncomingMessage';
import { StarlightServerResponse as ServerResponse } from '../http/StarlightServerResponse';

export const rootFolder = join(__dirname, '..', '..', '..');

export namespace HTTPConstants {
	const lowerMethods: Record<string, string> = {};
	for (const method of METHODS) lowerMethods[method] = method.toLowerCase();

	export const METHODS_LOWER = lowerMethods as Readonly<Record<string, string>>;

	export const RESPONSES = {
		FETCHING_TOKEN: '{"message":"Error fetching token"}',
		NO_CODE: '{"message":"No code provided"}',
		UNAUTHORIZED: '{"message":"Unauthorized"}',
		NOT_READY: '{"message":"No OAuth User Route Loaded"}',
		OK: '{"message":"Ok"}',
		UPDATED: [
			'{"updated":false}',
			'{"updated":true}'
		] as const
	} as const;

	export const OPTIONS = {
		hooks: {
			apiPrefix: 'api/',
			origin: '*',
			port: 4000,
			serverOptions: {
				IncomingMessage,
				ServerResponse
			}
		}
	};
}
