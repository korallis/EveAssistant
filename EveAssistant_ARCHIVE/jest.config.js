module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testEnvironmentOptions: {
    'jsdom': {
      'resources': 'usable',
    },
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        'jsx': 'react-jsx',
      },
    }],
  },
  testMatch: [
    "**/?(*.)+(spec|test).[tj]s?(x)"
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^p-limit$': '<rootDir>/node_modules/p-limit/dist/index.js',
  },
  transformIgnorePatterns: [
    "node_modules/(?!(p-limit|yocto-queue)/)"
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
}; 