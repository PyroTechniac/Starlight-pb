import { Duration } from '@klasa/duration';
import { StarlightIncomingMessage } from '../lib/http/StarlightIncomingMessage';
import { Route } from '../lib/http/Route';
import { StarlightServerResponse } from '../lib/http/StarlightServerResponse';
import { setRoute, ratelimit } from '../lib/util/decorators';

@setRoute('application')
export default class extends Route {

	@ratelimit(2, 5000)
	public get(_request: StarlightIncomingMessage, response: StarlightServerResponse): void {
		return response.json({
			users: this.client.users.size,
			guilds: this.client.guilds.size,
			channels: this.client.channels.size,
			dms: this.client.dms.size,
			shards: this.client.ws.shards.size,
			uptime: Duration.toNow(Date.now() - (process.uptime() * 1000)),
			latency: this.client.ws.ping.toFixed(0),
			memory: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
			invite: this.client.invite
		});
	}

}
