var assert = require('assert'),
    resolveModule = require('../../lib/resolve'),
    getLookUpPaths = resolveModule.getLookUpPaths,
    removeDotsFromPath = resolveModule.removeDotsFromPath,
    resolve = resolveModule.resolve;

///////////////////////////////////////////////////////////////////////////////////////

assert.equal(removeDotsFromPath('./aaa'), 'aaa');
assert.equal(removeDotsFromPath('./aaa/'), 'aaa/');
assert.equal(removeDotsFromPath('././aaa'), 'aaa');
assert.equal(removeDotsFromPath('aaa/bbb'), 'aaa/bbb');
assert.equal(removeDotsFromPath('./aaa/bbb/../ccc'), 'aaa/ccc');
assert.equal(removeDotsFromPath('./aaa/bbb/ccc/ddd/../../../../eee'), 'eee');
assert.equal(removeDotsFromPath('../'), undefined);
assert.equal(removeDotsFromPath('aaa/bbb/../../../ccc'), undefined);

///////////////////////////////////////////////////////////////////////////////////////

resolveModule.setCurrentModuleDir('/aaa/node_modules/bbb/node_modules/ccc');
assert.deepEqual(getLookUpPaths('./ddd'), ['/aaa/node_modules/bbb/node_modules/ccc/ddd']);
assert.deepEqual(getLookUpPaths('../ddd'), ['/aaa/node_modules/bbb/node_modules/ddd']);
assert.deepEqual(getLookUpPaths('../.././ddd'), ['/aaa/node_modules/bbb/ddd']);
assert.deepEqual(getLookUpPaths('/ddd'), ['/ddd']);
assert.deepEqual(getLookUpPaths('eee'), ['/aaa/node_modules/bbb/node_modules/eee', '/aaa/node_modules/eee']);
assert.deepEqual(getLookUpPaths('eee/fff'), ['/aaa/node_modules/bbb/node_modules/eee/fff', '/aaa/node_modules/eee/fff']);
assert.deepEqual(getLookUpPaths('eee/fff/../../ggg'), ['/aaa/node_modules/bbb/node_modules/ggg', '/aaa/node_modules/ggg']);

///////////////////////////////////////////////////////////////////////////////////////

resolveModule.setCurrentModuleDir('/aaa/bbb');
assert.deepEqual(getLookUpPaths('ccc'), ['/aaa/bbb/node_modules/ccc', '/aaa/node_modules/ccc', '/node_modules/ccc']);
resolveModule.setCurrentModuleDir('/aaa/bbb/ccc');
assert.deepEqual(getLookUpPaths('ddd'), ['/aaa/bbb/ccc/node_modules/ddd', '/aaa/bbb/node_modules/ddd', '/aaa/node_modules/ddd', '/node_modules/ddd']);
resolveModule.setCurrentModuleDir('/aaa/bbb');
assert.deepEqual(getLookUpPaths('ccc/../../ddd'), ['/aaa/bbb/ddd', '/aaa/ddd', '/ddd']);

///////////////////////////////////////////////////////////////////////////////////////

resolveModule.setModules({
    '/aaa/bbb/ccc.js': true,
    '/aaa/bbb/ccc/ddd.js': true,
    '/aaa/bbb/ccc/ddd/eee/index.js': true,
    '/aaa/bbb/ccc/eee.js': true,
    '/aaa/eee.js': true,
    '/aaa/bbb/eee': true,
    '/eee': true
});
resolveModule.setCurrentModuleDir('/aaa/bbb/ccc');
assert.equal(resolve('./ddd'), '/aaa/bbb/ccc/ddd.js');
assert.equal(resolve('./ddd/eee'), '/aaa/bbb/ccc/ddd/eee');
assert.equal(resolve('./ddd/./eee'), '/aaa/bbb/ccc/ddd/eee');
assert.equal(resolve('./ddd/../eee'), '/aaa/bbb/ccc/eee.js');
assert.equal(resolve('./../../eee.js'), '/aaa/eee.js');
assert.equal(resolve('././../eee'), '/aaa/bbb/eee');
assert.equal(resolve('../../../eee'), '/eee');
assert.throws(function() {
    resolve('/fff');
});
assert.throws(function() {
    resolve('/aaa/bbb/eee.js');
});
assert.throws(function() {
    resolve('../../../../');
});

///////////////////////////////////////////////////////////////////////////////////////

resolveModule.setModules({
    '/aaa/bbb/test.js': true,
    '/aaa/node_modules/test.js': true,
    '/aaa/node_modules/bbb/node_modules/test.js': true
});
resolveModule.setCurrentModuleDir('/aaa/bbb');
assert.equal(resolve('./test'), '/aaa/bbb/test.js');
assert.throws(function() {
    resolve('../test');
});
assert.equal(resolve('test'), '/aaa/node_modules/test.js');
resolveModule.setCurrentModuleDir('/aaa/node_modules');
assert.equal(resolve('test'), '/aaa/node_modules/test.js');
resolveModule.setCurrentModuleDir('/aaa/node_modules/bbb/node_modules/ccc');
assert.equal(resolve('test'), '/aaa/node_modules/bbb/node_modules/test.js');

///////////////////////////////////////////////////////////////////////////////////////

/*
resolveModule.setModules({
    '/aaa/node_modules/bbb': true,
    '/aaa/bbb/test': true,
    '/aaa/node_modules/bbb/node_modules/ccc': true,
    '/aaa/node_modules/test': true,
    '/aaa/node_modules/bbb/node_modules/test': true
});*/