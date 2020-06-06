import { Route } from '../lib/http/Route';
import { setRoute, ratelimit } from '../lib/util/decorators';
import type OAuthUser from './oauthUser';
import { StarlightIncomingMessage } from '../lib/http/StarlightIncomingMessage';
import { StarlightServerResponse } from '../lib/http/StarlightServerResponse';
import { Time } from '../lib/types/enums';
import { HTTPConstants } from '../lib/util/constants';
import { URL, URLSearchParams } from 'url';
import fetch from 'node-fetch';
import { HTTPUtils } from '../lib/util/utils';

@setRoute('oauth/callback')
export default class extends Route {

	private get oauthUser(): OAuthUser | undefined {
		return this.store.get('oauthUser') as OAuthUser | undefined;
	}

	@ratelimit(2, Time.Minute)
	public async post(request: StarlightIncomingMessage, response: StarlightServerResponse): Promise<void> {
		/* eslint-disable camelcase */
		if (!request.body.code) return this.noCode(response);
		const url = new URL('https://discord.com/api/oauth2/token');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		url.search = new URLSearchParams([
			['grant_type', 'authorization_code'],
			['redirect_uri', request.body.redirectUri],
			['code', request.body.code]
		]);

		const res = await fetch(url, {
			headers: { Authorization: `Basic ${Buffer.from(`${this.client.options.hooks.clientID}:${this.client.options.hooks.clientSecret}`).toString('base64')}` },
			method: 'POST'
		});

		if (!res.ok) return response.error(HTTPConstants.RESPONSES.FETCHING_TOKEN);

		const { oauthUser } = this;

		if (typeof oauthUser === 'undefined') return this.notReady(response);

		const body = await res.json();
		const user = await oauthUser.api(body.access_token);

		return response.json({
			access_token: HTTPUtils.encrypt({
				token: body.access_token,
				scope: [user.id, ...user.guilds.filter((guild): boolean => guild.userCanManage).map((guild): string => guild.id)]
			}, this.client.options.hooks.clientSecret),
			user
		});
		/* eslint-enable camelcase */
	}

	private notReady(response: StarlightServerResponse): void {
		return response.error(HTTPConstants.RESPONSES.NOT_READY);
	}

	private noCode(response: StarlightServerResponse): void {
		return response.error(HTTPConstants.RESPONSES.NO_CODE);
	}

}
