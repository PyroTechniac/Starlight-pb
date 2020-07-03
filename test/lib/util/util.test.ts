import * as utils from '@utils/util';

describe('noop', (): void => {
	test('noop returns null', (): void => {
		expect(utils.noop()).toBeNull();
	});
});

describe('toss', (): void => {
	test('toss with null throws null', (): void => {
		expect(utils.toss.bind(null, null)).toThrow();
	});

	test('toss with an Error throws the error', (): void => {
		expect(utils.toss.bind(null, new Error('Fail'))).toThrow('Fail');
	});
});

describe('filterArray', (): void => {
	test('Filters out duplicate primitive values', (): void => {
		expect(utils.filterArray([1, 2, 3, 2, 1])).toStrictEqual([1, 2, 3]);
	});

	test('Doesn\'t filter if values are unique', (): void => {
		expect(utils.filterArray([1, 2, 3, 4, 5])).toStrictEqual([1, 2, 3, 4, 5]);
	});

	test('Doesn\'t filter out non-primitive duplicate values', (): void => {
		expect(utils.filterArray([{ foo: 'bar' }, { foo: 'bar' }])).toStrictEqual([{ foo: 'bar' }, { foo: 'bar' }]);
	});
});

describe('isNullish', (): void => {
	test('Returns true for null and undefined values', (): void => {
		expect(utils.isNullish(null)).toBeTruthy();
		expect(utils.isNullish(undefined)).toBeTruthy();
	});

	test('Returns false for truthy values', (): void => {
		expect(utils.isNullish(1)).toBeFalsy();
		expect(utils.isNullish('Hello, world!')).toBeFalsy();
		expect(utils.isNullish(true)).toBeFalsy();
	});

	test('Returns false for falsy values', (): void => {
		expect(utils.isNullish(0)).toBeFalsy();
		expect(utils.isNullish('')).toBeFalsy();
		expect(utils.isNullish(false)).toBeFalsy();
	});
});
