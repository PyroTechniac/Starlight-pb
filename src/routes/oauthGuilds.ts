import { Route } from '@http/Route';
import { setRoute, ratelimit, authenticated } from '@utils/decorators';
import { StarlightIncomingMessage } from '@http/StarlightIncomingMessage';
import { StarlightServerResponse } from '@http/StarlightServerResponse';
import { Time } from '@lib/types/enums';
import { ClientEvents } from '@klasa/core';
import { inspect } from 'util';
import { HTTPConstants } from '@utils/constants';

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
