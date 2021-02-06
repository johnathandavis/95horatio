module.exports = {
	preset: 'jest-puppeteer',
	testMatch: [ "<rootDir>/integ/**/*.spec.ts?(x)" ],
	testPathIgnorePatterns: ['/node_modules/', 'dist'], // 
	setupFilesAfterEnv: ['<rootDir>/config/jest.setup.ts'],
	transform: {
		"^.+\\.ts?$": "babel-jest"
	},
	globalSetup: './config/jest.global-setup.ts'
};