import { Route } from '../lib/http/Route';
import { setRoute, ratelimit, authenticated } from '../lib/util/decorators';
import { StarlightIncomingMessage } from '../lib/http/StarlightIncomingMessage';
import { StarlightServerResponse } from '../lib/http/StarlightServerResponse';
import { Time } from '../lib/types/enums';
import { ClientEvents } from '@klasa/core';
import { inspect } from 'util';
import { HTTPConstants } from '../lib/util/constants';

@setRoute('oauth/user/guilds')
export default class extends Route {

	@authenticated
	@ratelimit(2, Time.Minute * 5, true)
	public async post(request: StarlightIncomingMessage, response: StarlightServerResponse): Promise<void> {
		const botGuild = this.client.guilds.get(request.body.id);
		if (typeof botGuild === 'undefined') return response.error(500);
		try {
			await botGuild.settings.update(request.body.data, { arrayAction: 'overwrite' });
		} catch (error) {
			this.client.emit(ClientEvents.Error, `${botGuild.name}[${botGuild.id}] Failed to update configs via dashboard with error:\n${inspect(error)}`);
			return response.error(HTTPConstants.RESPONSES.UPDATED[0]);
		}

		return response.end(HTTPConstants.RESPONSES.UPDATED[1]);
	}

}
