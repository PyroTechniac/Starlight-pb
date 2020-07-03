import { client } from '@mocks/MockInstances';
import { MockDecoratorCommandStore, MockDecoratorMessage as Message, MockDecoratorGuild as Guild } from '@mocks/MockDecorators';
import { Command, CommandOptions } from 'klasa';
import * as decorators from '@utils/decorators';
import type { CustomResolverFunction } from '@lib/types/interfaces';
import { Cache } from '@klasa/cache';

describe('mergeOptions', (): void => {
	test('mergeOptions correctly decorates a Piece', (): void => {
		@decorators.mergeOptions<CommandOptions>({
			name: 'test',
			cooldown: 10
		})
		class TestPiece extends Command {
			public getName(): string {
				return this.name;
			}
		}

		const instance = new TestPiece(new MockDecoratorCommandStore('name', client), __dirname, [__filename]);

		expect(instance.name).toBe('test');
		expect(instance.cooldowns.time).toBe(10);
		expect(instance.guarded).toBe(false);
		expect(Object.getOwnPropertyDescriptor(instance.constructor.prototype, 'getName')).toBeDefined();
	});

	test('mergeOptions correctly resolves options', (): void => {
		@decorators.mergeOptions((client): CommandOptions => ({
			enabled: !!client,
			name: 'test'
		}))
		class TestPiece extends Command {
			public getName(): string {
				return this.name;
			}
		}

		const instance = new TestPiece(new MockDecoratorCommandStore('name', client), __dirname, [__filename]);

		expect(instance.name).toBe('test');
		expect(instance.enabled).toBe(true);
		expect(instance.guarded).toBe(false);
		expect(Object.getOwnPropertyDescriptor(instance.constructor.prototype, 'getName')).toBeDefined();
	});
});


describe('resolvers', (): void => {
	const mockCommandStore = new MockDecoratorCommandStore('name', client);
	const receivedResolvers = new Cache<string, CustomResolverFunction>([
		[
			'key',
			(arg, _possible, message, [action]): unknown => {
				if (action === 'show' || arg) return arg || '';
				throw message.language.get('COMMAND_CONF_NOKEY');
			}
		],
		[
			'value',
			(arg, possible, message, [action]): unknown => {
				if (!['set', 'remove'].includes(action as string)) return null;
				if (arg) return message.client.arguments.get('...string')!.run(arg, possible, message);
				throw message.language.get('COMMAND_CONF_NOVALUE');
			}
		]
	]);

	describe('createResolvers', (): void => {
		test('createResolvers correctly applies itself', (): void => {
			@decorators.createResolvers([
				[
					'key',
					(arg, _possible, message, [action]): unknown => {
						if (action === 'show' || arg) return arg || '';
						throw message.language.get('COMMAND_CONF_NOKEY');
					}
				],
				[
					'value',
					(arg, possible, message, [action]): unknown => {
						if (!['set', 'remove'].includes(action as string)) return null;
						if (arg) return message.client.arguments.get('...string')!.run(arg, possible, message);
						throw message.language.get('COMMAND_CONF_NOVALUE');
					}
				]
			])
			class TestCommand extends Command { }

			const instance = new TestCommand(mockCommandStore, __dirname, [__filename]);

			expect(instance.usage.customResolvers.firstValue).toStrictEqual(expect.any(Function));
			expect(instance.usage.customResolvers.firstKey).toBe(receivedResolvers.firstKey);

			expect(instance.usage.customResolvers.lastValue).toStrictEqual(expect.any(Function));
			expect(instance.usage.customResolvers.lastKey).toStrictEqual(receivedResolvers.lastKey);

			expect(instance.usage.customResolvers.size).toBe(2);
		});

		test('createResolver works with mergeOptions', (): void => {
			@decorators.mergeOptions<CommandOptions>({
				name: 'test',
				cooldown: 10
			})
			@decorators.createResolvers([
				[
					'key',
					(arg, _possible, message, [action]): unknown => {
						if (action === 'show' || arg) return arg || '';
						throw message.language.get('COMMAND_CONF_NOKEY');
					}
				]
			])
			class TestCommand extends Command { }

			const instance = new TestCommand(mockCommandStore, __dirname, [__filename]);

			expect(instance.name).toBe('test');
			expect(instance.cooldowns.time).toBe(10);
			expect(instance.usage.customResolvers.firstValue).toStrictEqual(expect.any(Function));
			expect(instance.usage.customResolvers.firstKey).toBe(receivedResolvers.firstKey);

			expect(instance.usage.customResolvers.size).toBe(1);
		});
	});


	describe('createResolver', (): void => {
		test('createResolver applies to a command', (): void => {
			@decorators.createResolver('key', (arg, _possible, message, [action]): unknown => {
				if (action === 'show' || arg) return arg || '';
				throw message.language.get('COMMAND_CONF_NOKEY');
			})
			class TestCommand extends Command { }

			const instance = new TestCommand(mockCommandStore, __dirname, [__filename]);


			expect(instance.usage.customResolvers.firstValue).toStrictEqual(expect.any(Function));
			expect(instance.usage.customResolvers.firstKey).toBe(receivedResolvers.firstKey);

			expect(instance.usage.customResolvers.size).toBe(1);
		});
	});
});

describe('requiresDMContext', (): void => {
	class Test {
		@decorators.requiresDMContext()
		public inGuild(message: Message): Promise<boolean> {
			return Promise.resolve(message.guild === null);
		}
	}

	const instance = new Test();

	test('fails when message is from a guild', async (): Promise<void> => {
		expect.assertions(1);
		const guild = new Guild('Guild');
		const message = new Message('Hello, world!', guild, 5);
		const inGuild = await instance.inGuild(message);
		expect(inGuild).toBeUndefined();
	});

	test('succeeds when message is from DM', async (): Promise<void> => {
		const guild = null;
		const message = new Message('Hello, world!', guild, 5);
		const inGuild = await instance.inGuild(message);
		expect(inGuild).toBe(true);
	})
});

describe('requiresGuildContext', (): void => {
	class Test {
		@decorators.requiresGuildContext()
		public getName(message: Message): Promise<string> {
			return Promise.resolve(message.guild!.name);
		}
	}

	const instance = new Test();

	test('succeeds when message is from guild', async (): Promise<void> => {
		const guild = new Guild('Guild');
		const message = new Message('Hello, world!', guild, 5);
		const name = await instance.getName(message);
		expect(name).toBe('Guild');
	});

	test('fails when message is from DM', async (): Promise<void> => {
		const guild = null;
		const message = new Message('Hello, world!', guild, 5);
		const name = await instance.getName(message);
		expect(name).toBeUndefined();
	});
});

describe('requiresPermission', (): void => {
	class Test {
		@decorators.requiresPermission(5)
		public getContet(message: Message): Promise<string> {
			return Promise.resolve(message.content);
		}
	}

	const instance = new Test();

	test('fails when permission level is too low', async (): Promise<void> => {
		const message = new Message('Hello, world!', null, 4);
		const content = await instance.getContet(message);
		expect(content).toBeUndefined();
	});

	test('succeeds when permission level is high enough', async (): Promise<void> => {
		const message = new Message('Hello, world!', null, 5);
		const content = await instance.getContet(message);
		expect(content).toBe('Hello, world!');
	});
});
