/**
 * Jest Configuration
 *
 * Uses ESM (node --experimental-vm-modules) for ES module support. Tests run
 * with NODE_ENV=test so config validation is skipped and no external services
 * are required. A setup file provides global test utilities.
 */

export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/docs/**',
    '!src/index.js',
    '!src/server.js',
  ],
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 5,
      lines: 20,
      statements: 20,
    },
  },
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
};