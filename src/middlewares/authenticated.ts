import type { StarlightIncomingMessage } from '../lib/http/StarlightIncomingMessage';
import { Middleware, MiddlewareOptions } from '../lib/http/Middleware';
import type { Route } from '../lib/http/Route';
import type { StarlightServerResponse } from '../lib/http/StarlightServerResponse';
import { mergeOptions } from '../lib/util/decorators';
import { HTTPUtils } from '../lib/util/utils';

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
