/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          module: 'commonjs',
          target: 'es2018',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          moduleResolution: 'node10',
          ignoreDeprecations: '5.0',
          lib: ['dom', 'dom.iterable', 'esnext'],
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/test/**/*.test.ts', '**/test/**/*.test.tsx'],
  setupFiles: ['./test/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
};
