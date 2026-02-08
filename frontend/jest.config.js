module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!app/**/page.tsx', // Exclude page components from coverage
    '!app/**/layout.tsx', // Exclude layout components from coverage
    '!app/**/loading.tsx', // Exclude loading components from coverage
    '!app/**/error.tsx', // Exclude error components from coverage
    '!app/**/not-found.tsx', // Exclude not-found components from coverage
  ],
};