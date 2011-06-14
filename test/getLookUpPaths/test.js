var assert = require('assert'),
    getLookUpPaths = require('../../lib/getLookUpPaths');
    
var currentModuleDir;

///////////////////////////////////////////////////////////////////////////////////////

currentModuleDir = '/aaa/node_modules/bbb/node_modules/ccc';
assert.deepEqual(
    getLookUpPaths(currentModuleDir, './ddd'),
    ['/aaa/node_modules/bbb/node_modules/ccc/ddd']
);
assert.deepEqual(
    getLookUpPaths(currentModuleDir, '../ddd'),
    ['/aaa/node_modules/bbb/node_modules/ddd']
);
assert.deepEqual(
    getLookUpPaths(currentModuleDir, '../.././ddd'),
    ['/aaa/node_modules/bbb/ddd']
);
assert.deepEqual(
    getLookUpPaths(currentModuleDir, '/ddd'),
    ['/ddd']
);
assert.deepEqual(
    getLookUpPaths(currentModuleDir, 'eee'),
    ['/aaa/node_modules/bbb/node_modules/eee', '/aaa/node_modules/eee']
);
assert.deepEqual(
    getLookUpPaths(currentModuleDir, 'eee/fff'),
    ['/aaa/node_modules/bbb/node_modules/eee/fff', '/aaa/node_modules/eee/fff']
);
assert.deepEqual(
    getLookUpPaths(currentModuleDir, 'eee/fff/../../ggg'),
    ['/aaa/node_modules/bbb/node_modules/ggg', '/aaa/node_modules/ggg']
);

///////////////////////////////////////////////////////////////////////////////////////

currentModuleDir = '/aaa/bbb';
assert.deepEqual(
    getLookUpPaths(currentModuleDir, 'ccc'),
    ['/aaa/bbb/node_modules/ccc', '/aaa/node_modules/ccc', '/node_modules/ccc']
);

///////////////////////////////////////////////////////////////////////////////////////

currentModuleDir = '/aaa/bbb/ccc';
assert.deepEqual(
    getLookUpPaths(currentModuleDir, 'ddd'),
    ['/aaa/bbb/ccc/node_modules/ddd', '/aaa/bbb/node_modules/ddd', '/aaa/node_modules/ddd', '/node_modules/ddd']
);

///////////////////////////////////////////////////////////////////////////////////////

currentModuleDir = '/aaa/bbb';
assert.deepEqual(
    getLookUpPaths(currentModuleDir, 'ccc/../../ddd'),
    ['/aaa/bbb/ddd', '/aaa/ddd', '/ddd']
);