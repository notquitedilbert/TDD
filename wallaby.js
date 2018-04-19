process.env.NODE_ENV='test';

module.exports = function (wallaby) {
    return {
        //debug: true,
        name:'quick test',
        files: [
            'server.js',
            'models/**/*.js',
            'routes/**/*.js',
            'services/*.js',
            'tests/data/**/*.js',
            'config/*.json',
        ],
        tests: [
            'tests/**/*spec.js'
        ],
        testFramework: 'mocha',
        env: {
            type: 'node'
        },
        workers: {
            restart: true
        },
    };
};
