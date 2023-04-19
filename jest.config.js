module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '.git', '/dist/'],
  setupFiles: [
    '<rootDir>/.jest/setEnvVars.ts',
    './setupJest.ts'
  ],
  automock: false,
  collectCoverageFrom: ['dist/*.js'],
};
