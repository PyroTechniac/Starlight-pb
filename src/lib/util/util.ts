export function noop(): null {
	return null;
}

export function toss(exception: unknown): never {
	throw exception;
}

export function filterArray<V>(array: V[]): V[] {
	return [...new Set(array)];
}

export function isNullish(value: unknown): value is (null | undefined) {
	return value === null || value === undefined;
}
