import type { AssetStore } from '@lib/structures/AssetStore';
import type { SchemaEngine } from '@lib/structures/SchemaEngine';
import type { DashboardHooks } from '@http/DashboardHooks';
import type { DashboardHooksOptions } from '@lib/types/interfaces';
import type { RouteStore } from '@http/RouteStore';
import type { MiddlewareStore } from '@http/MiddlewareStore';
import type { DataStore } from '@klasa/core';
import type { DashboardUser } from '@http/DashboardUser';

declare module '@klasa/core/dist/src/lib/client/Client' {
	export interface Client {
		hooks: DashboardHooks;
		assets: AssetStore;
		routes: RouteStore;
		middlewares: MiddlewareStore;
		dashboardUsers: DataStore<DashboardUser>;
		schemas: SchemaEngine;
	}

	export interface ClientOptions {
		hooks?: DashboardHooksOptions;
	}

	export interface CacheLimits {
		dashboardUsers?: number;
	}
}

declare module 'klasa/dist/src/lib/structures/Provider' {
	export interface Provider {
		readonly shouldUnload: boolean; // eslint-disable-line @typescript-eslint/naming-convention
	}
}
