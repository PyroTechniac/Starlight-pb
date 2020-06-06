import { Client, Permissions, PermissionsFlags, Guild } from '@klasa/core';
import type { DashboardUser } from './DashboardUser';

export interface OAuthGuildData {
	id: string;
	name: string;
	icon: string | null;
	owner: boolean;
	permissions: number;
	userCanManage: boolean;
}

export class DashboardGuild {

	public id: string;

	public name: string;

	public icon: string | null;

	public userIsOwner: boolean;

	public userGuildPermissions: Permissions;

	public userCanManage: boolean;

	public constructor(public readonly client: Client, guild: OAuthGuildData, public user: DashboardUser) {
		this.id = guild.id;
		this.name = guild.name;
		this.icon = guild.icon;
		this.userIsOwner = guild.owner;
		this.userGuildPermissions = new Permissions(guild.permissions);
		this.userCanManage = this.userGuildPermissions.has(PermissionsFlags.ManageGuild);
	}

	public get iconURL(): string | null {
		if (this.icon) return `https://cdn.discordapp.com/icons/${this.id}/${this.icon}.png`;
		return null;
	}

	public get guild(): Guild | null {
		return this.client.guilds.get(this.id) ?? null;
	}

	public toJSON(): Record<string, unknown> {
		const guild = ((gld): Record<string, unknown> => gld ? gld.toJSON() : {})(this.guild);
		return {
			...guild,
			id: this.id,
			name: this.name,
			iconURL: this.iconURL,
			userIsOwner: this.userIsOwner,
			userGuildPermissions: this.userGuildPermissions,
			userCanManage: this.userCanManage
		};
	}

}
