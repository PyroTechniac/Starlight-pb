import { Middleware, MiddlewareOptions } from '@http/Middleware';
import { mergeOptions } from '@utils/decorators';
import type { StarlightIncomingMessage } from '@http/StarlightIncomingMessage';
import type { StarlightServerResponse } from '@http/StarlightServerResponse';

@mergeOptions<MiddlewareOptions>({
	priority: 10
})
export default class extends Middleware {

	public run(request: StarlightIncomingMessage, response: StarlightServerResponse): void {
		response.setHeader('Access-Control-Allow-Origin', this.client.options.hooks.origin);
		response.setHeader('Access-Control-Allow-Methods', 'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT');
		response.setHeader('Access-Control-Allow-Headers', 'Authorization, User-Agent, Content-Type');
		if (request.method === 'OPTIONS') {
			response.text('Something');
			return;
		}
		response.setHeader('Content-Type', 'application/json');
	}

}
