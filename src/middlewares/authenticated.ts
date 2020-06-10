import type { StarlightIncomingMessage } from '@http/StarlightIncomingMessage';
import { Middleware, MiddlewareOptions } from '@http/Middleware';
import type { Route } from '@http/Route';
import type { StarlightServerResponse } from '@http/StarlightServerResponse';
import { mergeOptions } from '@utils/decorators';
import { HTTPUtils } from '@utils/utils';

@mergeOptions<MiddlewareOptions>({
	priority: 100
})
export default class extends Middleware {

	public run(request: StarlightIncomingMessage, response: StarlightServerResponse, route: Route): void {
		if (!route || !route.authenticated) return;
		try {
			request.auth = HTTPUtils.decrypt(request.headers.authorization!, this.client.options.hooks.clientSecret);
			if (request.method === 'POST' && !request.auth.scope.includes(request.body.id)) throw true;
		} catch {
			return response.error(401);
		}
	}

}
