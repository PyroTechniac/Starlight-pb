import { Task } from 'klasa';
import { sleep } from '@klasa/utils';

export default class extends Task {

	public async run(): Promise<void> {
		await sleep(5);
		this.client.console.log('Task ran!');
	}

}
