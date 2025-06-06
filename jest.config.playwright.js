module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    "e2e/**/*.test.ts"
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        'jsx': 'react-jsx',
      },
    }],
  },
}; 