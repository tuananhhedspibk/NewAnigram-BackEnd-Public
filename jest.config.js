const { defaults } = require('jest-config');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: [ ...defaults.moduleFileExtensions, 'ts' ],
  globalSetup: './tests/utils/setup.ts',
  globalTeardown: './tests/utils/teardown.ts',
  testTimeout: 5000,
};
