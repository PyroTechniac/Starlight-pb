import { Extendable } from '@utils/decorators';
import { Provider } from 'klasa';

export default class extends Extendable(Provider) {

	public get shouldUnload(): boolean {
		return this.client.providers.default!.name !== this.name;
	}

}
