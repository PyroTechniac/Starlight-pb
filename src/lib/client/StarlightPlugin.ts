import { Plugin, Client } from '@klasa/core';

export abstract class StarlightPlugin extends Plugin {

	public static [Symbol.hasInstance](value: any): value is Plugin { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
		return typeof value?.constructor?.[Client.plugin] === 'function'; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
	}

}
