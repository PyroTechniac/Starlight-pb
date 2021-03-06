import { Cache } from '@klasa/cache';
import { IdKeyed, RequestHandler } from '@klasa/request-handler';
import { UserSettings } from '@lib/structures/settings/UserSettings';
import { Gateway, ProxyMapEntry, GatewayStorage, KlasaClient } from 'klasa';

export class UserGateway extends GatewayStorage implements Gateway {

	public cache = new Cache<string, ProxyMapEntry>();
	public requestHandler = new RequestHandler<string, IdKeyed<string>>(
		(id): Promise<IdKeyed<string>> => Promise.resolve({ id }),
		(): Promise<IdKeyed<string>[]> => Promise.resolve([])
	);

	public constructor(client: KlasaClient) {
		super(client, 'users');
	}

	public acquire(target: IdKeyed<string>, id?: string | undefined): UserSettings {
		return this.create(target, id);
	}

	public get(): UserSettings {
		return null!;
	}

	public create(target: IdKeyed<string>, id?: string | undefined): UserSettings {
		return new UserSettings(this, target, id ?? target.id);
	}

}
