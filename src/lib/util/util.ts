import type { APIErrors } from '@lib/types/enums';
import { DiscordAPIError } from '@klasa/rest';

export function noop(): null {
	return null;
}

export function toss(exception: unknown): never {
	throw exception;
}

export function filterArray<V>(array: V[]): V[] {
	return Array.from(new Set(array));
}

export function isNullish(value: unknown): value is (null | undefined) {
	return value === null || value === undefined;
}

export function ensureOrThrow<V>(value: V, err: unknown): V {
	return value ?? toss(err);
}

export async function resolveOnErrorCodes<T>(promise: Promise<T>, ...codes: readonly APIErrors[]): Promise<T | null> {
	try {
		return await promise;
	} catch (error) {
		if (error instanceof DiscordAPIError && codes.includes(error.code)) return null;
		throw error;
	}
}
