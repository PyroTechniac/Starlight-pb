import { Serializer, SerializerUpdateContext } from 'klasa';
import { URL } from 'url';

export default class extends Serializer {

	private readonly kProtocol = /^https?:\/\//;

	public validate(data: string, { entry, language }: SerializerUpdateContext): Promise<string> {
		try {
			const { hostname } = new URL(this.kProtocol.test(data) ? data : `https://${data}`);
			return hostname.length > 128 ? Promise.reject(language.get('RESOLVER_MINMAX_MAX', entry.path, 128, true)) : Promise.resolve(hostname);
		} catch {
			return Promise.reject(language.get('RESOLVER_INVALID_URL', entry.path));
		}
	}

	public stringify(data: string): string {
		return `https://${data}`;
	}

}
