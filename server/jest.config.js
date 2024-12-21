module.exports = {
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'clover'],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/tests/'
    ],
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    setupFiles: ['dotenv/config']
};
