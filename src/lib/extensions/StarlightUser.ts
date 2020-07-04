import { Constructor, extender } from '@klasa/core';
import type { Settings } from 'klasa';

export class StarlightUser extends (extender.get('User')) {

	public set settings(_value: Settings) {
		// noop
	}

}


extender.extend('User', (): Constructor<StarlightUser> => StarlightUser);
