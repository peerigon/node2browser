var testCase = require('nodeunit').testCase,
    nodeResolve = require('../../lib/nodeResolve');

///////////////////////////////////////////////////////////////////////////////////////

var currentModuleDir = __dirname + '/node_modules/folder1';

module.exports = testCase({
    relativePath: function(test) {
        test.equal(
            nodeResolve(currentModuleDir, './module2.js'),
            __dirname + '/node_modules/folder1/module2.js'
        );
        test.equal(
            nodeResolve(currentModuleDir, './module2'),
            __dirname + '/node_modules/folder1/module2.js'
        );
        test.equal(
            nodeResolve(currentModuleDir, './module1.js'),
            __dirname + '/node_modules/folder1/module1.js'
        );
        test.done();
    },
    indexJS: function(test) {
        test.equal(
            nodeResolve(currentModuleDir, 'otherModule'),
            __dirname + '/node_modules/otherModule/index.js'
        );
        test.done();
    },
    packageJSON: function(test) {
        test.equal(
            nodeResolve(currentModuleDir, 'someModule'),
            __dirname + '/node_modules/someModule/main.js'
        );
        test.equal(
            nodeResolve(currentModuleDir, 'someModule/package.json'),
            __dirname + '/node_modules/someModule/main.js'
        );
        test.done();
    }
});
