import { Cache } from '@klasa/cache';
import { User, Client } from '@klasa/core';
import type { APIUserData } from '@klasa/dapi-types';
import { DashboardGuild, OAuthGuildData } from './DashboardGuild';

export interface DashboardUserData extends APIUserData {
	guilds: OAuthGuildData[];
}

export class DashboardUser extends User {

	public guilds = new Cache<string, DashboardGuild>();

	public constructor(client: Client, data: DashboardUserData) {
		super(client, data);
		DashboardUser.setupGuilds(this, data.guilds);
	}

	public toJSON(): Record<string, unknown> {
		return {
			...super.toJSON(),
			guilds: [...this.guilds.values()]
		};
	}

	private static setupGuilds(dashboardUser: DashboardUser, guilds: readonly OAuthGuildData[]): void {
		for (const guild of guilds) dashboardUser.guilds.set(guild.id, new DashboardGuild(dashboardUser.client, guild, dashboardUser));
	}

}
