import { Client, PieceConstructor, Store } from '@klasa/core';
import { METHODS } from 'http';
import { HTTPConstants } from '@utils/constants';
import { Route } from '@http/Route';
import METHODS_LOWER = HTTPConstants.METHODS_LOWER;

export class RouteStore extends Store<Route> {

	public registry: Map<string, Map<string, Route>> = new Map();

	public constructor(client: Client) {
		super(client, 'routes', Route as unknown as PieceConstructor<Route>);

		this.client.registerStore(this);
		for (const method of METHODS) this.registry.set(method, new Map());
	}

	public findRoute(method: string, splitURL: readonly string[]): Route | undefined {
		for (const route of this.registry.get(method)!.values()) if (route.matches(splitURL)) return route;
	}

	public clear(): void {
		for (const method of METHODS) this.registry.get(method)!.clear();
		return super.clear();
	}

	public add(piece: Route): Route | null {
		const route = super.add(piece);
		if (!route) return null;
		for (const method of METHODS) if (METHODS_LOWER[method] in route) this.registry.get(method)!.set(route.name, route);
		return route;
	}

	public remove(name: Route | string): boolean {
		const route = this.resolve(name);
		if (!route) return false;
		for (const method of METHODS) this.registry.get(method)!.delete(route.name);
		return super.remove(route);
	}

}
