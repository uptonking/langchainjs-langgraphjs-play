import { createDefaultPreset } from 'ts-jest';

const tsJestPresetConfig = createDefaultPreset({
  tsconfig: {
    jsx: 'react',
  },
  diagnostics: {
    pretty: true,
  },
});

/** @type {import('ts-jest').JestConfigWithTsJest} */
const jestConfig = {
  ...tsJestPresetConfig,
  testEnvironment: 'jsdom',
};

const jestConfig1 = {
  // verbose: true,
  // roots: ['<rootDir>'],
  // testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
  // transformIgnorePatterns: ['^.+\\.js$'],
  transform: {
    // '\\.[jt]sx?$': ['babel-jest'],
    // [Jest encountered an unexpected token < ](https://github.com/kulshekhar/ts-jest/issues/937)
    '\\.[jt]sx?$': ['ts-jest', {}],
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
  },
  moduleNameMapper: {
    '^.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
  },
  // testMatch: [
  //   '<rootDir>/src/**/*.test.(ts|tsx)',
  //   '<rootDir>/**/*.test.(ts|tsx)',
  // ],
};

export default jestConfig;
