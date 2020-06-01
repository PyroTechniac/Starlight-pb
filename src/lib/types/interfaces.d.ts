import type { File } from '@klasa/rest';

export interface FileResolvable {
	resolve(): Promise<File>;
}
