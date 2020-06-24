import { Permissions, PermissionsFlags } from '@klasa/core';
import { toTitleCase } from '@klasa/utils';
import { Intents } from '@klasa/ws';
import { config } from 'dotenv';
import type { KlasaClientOptions } from 'klasa';
import { join, resolve } from 'path';

config();

const {
	PREFIX: prefix,
	PROVIDER: defaultProvider
} = process.env

export const rootFolder = join(__dirname, '..', '..', '..');

export const friendlyPermissionNames = Object.keys(Permissions.FLAGS).reduce((obj, key) => {
	Reflect.set(obj, key, toTitleCase(key.split('_').join(' ')));
	return obj;
}, {}) as Record<PermissionsFlags, string>;

const baseDirectory = (name: string): string => resolve(rootFolder, 'bwd', 'provider', name);

export const STARLIGHT_OPTIONS: KlasaClientOptions = {
	commands: {
		prefix: prefix ?? '!',
		logging: true,
		editing: true
	},
	rest: {
		offset: 0
	},
	ws: {
		intents: Intents.ALL
	},
	consoleEvents: {
		debug: true
	},
	providers: {
		'default': defaultProvider ?? 'json',
		'json': { baseDirectory: baseDirectory('json') }
	}
}
