var assert = require('assert'),
    nodeResolve = require('../../lib/nodeResolve'),
    currentModuleDir;
    
///////////////////////////////////////////////////////////////////////////////////////

currentModuleDir = __dirname + '/node_modules/folder1';
assert.equal(
    nodeResolve(currentModuleDir, './module2.js'),
    __dirname + '/node_modules/folder1/module2.js'
);
assert.equal(
    nodeResolve(currentModuleDir, './module2'),
    __dirname + '/node_modules/folder1/module2.js'
);
assert.equal(
    nodeResolve(currentModuleDir, './module1.js'),
    __dirname + '/node_modules/folder1/module1.js'
);

///////////////////////////////////////////////////////////////////////////////////////

assert.equal(
    nodeResolve(currentModuleDir, 'someModule'),
    __dirname + '/node_modules/someModule/main.js'
);

assert.equal(
    nodeResolve(currentModuleDir, 'someModule/package.json'),
    __dirname + '/node_modules/someModule/main.js'
);

///////////////////////////////////////////////////////////////////////////////////////

assert.equal(
    nodeResolve(currentModuleDir, 'otherModule'),
    __dirname + '/node_modules/otherModule/index.js'
);