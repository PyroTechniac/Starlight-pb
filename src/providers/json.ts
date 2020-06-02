import { outputJSONAtomic, readJSON } from 'fs-nextra';
import { FileSystemProvider } from '../lib/extensions/FileSystemProvider';

export default class extends FileSystemProvider {
	public read(file: string): Promise<unknown> {
		return readJSON(file);
	}

	public write(path: string, data: object): Promise<unknown> {
		return outputJSONAtomic(path, data, { spaces: this.client.options.production ? undefined : 4 });
	}
}
