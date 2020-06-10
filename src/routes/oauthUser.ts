import fetch from 'node-fetch';
import type { DashboardUser } from '@http/DashboardUser';
import { Route } from '@http/Route';
import { setRoute, ratelimit, authenticated } from '@utils/decorators';
import { StarlightIncomingMessage } from '@http/StarlightIncomingMessage';
import { StarlightServerResponse } from '@http/StarlightServerResponse';
import { Time } from '@lib/types/enums';
import { HTTPUtils } from '@utils/utils';
import { ClientEvents } from '@klasa/core';
import { inspect } from 'util';
import { HTTPConstants } from '@utils/constants';

@setRoute('oauth/user')
export default class extends Route {

	public async api(token: string): Promise<DashboardUser> {
		token = `Bearer ${token}`;
		const user = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: token } })
			.then((res): Record<PropertyKey, any> => res.json());
		await this.client.users.fetch(user.id);
		user.guilds = await fetch('https://discord.com/api/users/@me/guilds', { headers: { Authorization: token } })
			.then((res): Record<PropertyKey, any> => res.json());
		// eslint-disable-next-line
		return this.client.dashboardUsers['_add'](user);
	}

	@authenticated
	@ratelimit(2, Time.Minute * 2, true)
	public async get(request: StarlightIncomingMessage, response: StarlightServerResponse): Promise<void> {
		const dashboardUser = this.client.dashboardUsers.get(request.auth.scope[0]) ?? await this.fetchUser(request, response);

		return response.json(dashboardUser);
	}

	@authenticated
	@ratelimit(2, Time.Minute * 5, true)
	public async post(request: StarlightIncomingMessage, response: StarlightServerResponse): Promise<void> {
		const user = await this.client.users.fetch(request.body.id);
		if (typeof user === 'undefined') return response.end(500);
		try {
			await user.settings.update(request.body.data, { arrayAction: 'overwrite' });
		} catch (error) {
			this.client.emit(ClientEvents.Error, `${user.tag}[${user.id}] Failed to update configs via dashboard with error:\n${inspect(error)}`);
			return response.error(HTTPConstants.RESPONSES.UPDATED[0]);
		}

		return response.end(HTTPConstants.RESPONSES.UPDATED[1]);
	}

	private async fetchUser(request: StarlightIncomingMessage, response: StarlightServerResponse): Promise<DashboardUser> {
		const dashboardUser = await this.api(request.auth.token);
		response.setHeader('Authorization', HTTPUtils.encrypt({
			token: request.auth.token,
			scope: [dashboardUser.id, ...dashboardUser.guilds.filter((guild): boolean => guild.userCanManage).map((guild): string => guild.id)]
		}, this.client.options.hooks.clientSecret));

		return dashboardUser;
	}

}
