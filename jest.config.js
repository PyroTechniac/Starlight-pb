module.exports = {
	displayName: 'unit test',
	preset: 'ts-jest',
	testEnvironment: 'node',
	testRunner: 'jest-circus/runner',
	testMatch: ['<rootDir>/test/**/*.test.ts'],
	moduleNameMapper: {
		'^@utils/(.*)$': '<rootDir>/src/lib/util/$1',
		'^@lib/(.*)$': '<rootDir>/src/lib/$1',
		'^@root/(.*)$': '<rootDir>/src/$1',
		'^@mocks/(.*)$': '<rootDir>/test/mocks/$1'
	},
	setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
	globals: {
		'ts-jest': {
			tsConfig: '<rootDir>/test/tsconfig.json'
		}
	},
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'clover'],
	collectCoverage: true,
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80
		}
	}
}
