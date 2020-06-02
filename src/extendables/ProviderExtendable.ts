import { Provider } from 'klasa';
import { Extendable } from '../lib/util/decorators';

export default class extends Extendable(Provider) {

	public get shouldUnload(): boolean {
		return this.client.providers.default!.name !== this.name;
	}

}
