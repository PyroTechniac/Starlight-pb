import {Settings} from 'klasa';

export class UserSettings extends Settings {
	public sync(): Promise<this> {
		return Promise.resolve(this);
	}

	public destroy(): Promise<this> {
		return Promise.resolve(this);
	}
}
