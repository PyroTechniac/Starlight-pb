import { join } from "path";
import { mergeDefault } from '@klasa/utils';
import { KlasaClientDefaults, KlasaClientOptions } from 'klasa';

export const rootFolder = join(__dirname, '..', '..', '..');

export const StarlightClientOptions: KlasaClientOptions = mergeDefault(KlasaClientDefaults, {
	pieces: {
		defaults: {
			assets: {
				enabled: true
			}
		}
	}
}) as unknown as KlasaClientOptions;
