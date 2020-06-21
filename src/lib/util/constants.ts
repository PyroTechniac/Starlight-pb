import { join } from 'path';
import { PermissionsFlags, Permissions } from '@klasa/core';
import { toTitleCase } from '@klasa/utils';

export const rootFolder = join(__dirname, '..', '..', '..');

export const friendlyPermissionNames = Object.keys(Permissions.FLAGS).reduce((obj, key) => {
	Reflect.set(obj, key, toTitleCase(key.split('_').join(' ')));
	return obj;
}, {}) as Record<PermissionsFlags, string>;
