module.exports = {
  preset: 'ts-jest',
	testMatch: [ "<rootDir>/test/**/*.spec.ts?(x)" ],
	testPathIgnorePatterns: ['/node_modules/', 'dist'], // 
	setupFilesAfterEnv: ['<rootDir>/config/jest.setup.ts']
};