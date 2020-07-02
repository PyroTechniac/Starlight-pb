import { Provider, Extendable, ExtendableOptions } from 'klasa';
import { mergeOptions } from '@utils/decorators';
import type { Constructor } from '@klasa/core';

@mergeOptions<ExtendableOptions>({
	appliesTo: [Provider as Constructor<Provider>]
})
export default class extends Extendable {

	public get shouldUnload(): boolean {
		return this.client.providers.default!.name !== this.name;
	}

}
