var assert = require('assert'),
    resolveModule = require('../../lib/browserResolve'),
    resolve = resolveModule.resolve,
    setModules = resolveModule.setModules,
    setCurrentModuleDir = resolveModule.setCurrentModuleDir;

///////////////////////////////////////////////////////////////////////////////////////

setModules({
    '/aaa/bbb/ccc.js': true,
    '/aaa/bbb/ccc/ddd.js': true,
    '/aaa/bbb/ccc/ddd/eee/index.js': true,
    '/aaa/bbb/ccc/eee.js': true,
    '/aaa/eee.js': true,
    '/aaa/bbb/eee.js': true,
    '/eee/index.js': true
});
setCurrentModuleDir('/aaa/bbb/ccc');

assert.equal(resolve('./ddd'), '/aaa/bbb/ccc/ddd.js');
assert.equal(resolve('./ddd/eee'), '/aaa/bbb/ccc/ddd/eee/index.js');
assert.equal(resolve('./ddd/./eee'), '/aaa/bbb/ccc/ddd/eee/index.js');
assert.equal(resolve('./ddd/../eee'), '/aaa/bbb/ccc/eee.js');
assert.equal(resolve('./../../eee.js'), '/aaa/eee.js');
assert.equal(resolve('././../eee'), '/aaa/bbb/eee.js');
assert.equal(resolve('../../../eee'), '/eee/index.js');
assert.throws(function() {
    resolve('/fff');
});
assert.throws(function() {
    resolve('../../../../');
});

///////////////////////////////////////////////////////////////////////////////////////

setModules({
    '/aaa/bbb/test.js': true,
    '/aaa/node_modules/test.js': true,
    '/aaa/node_modules/bbb/node_modules/test.js': true
});
setCurrentModuleDir('/aaa/bbb');

assert.equal(resolve('./test'), '/aaa/bbb/test.js');
assert.throws(function() {
    resolve('../test');
});
assert.equal(resolve('test'), '/aaa/node_modules/test.js');

///////////////////////////////////////////////////////////////////////////////////////

setCurrentModuleDir('/aaa/node_modules');
assert.equal(resolve('test'), '/aaa/node_modules/test.js');

///////////////////////////////////////////////////////////////////////////////////////

setCurrentModuleDir('/aaa/node_modules/bbb/node_modules/ccc');
assert.equal(resolve('test'), '/aaa/node_modules/bbb/node_modules/test.js');

///////////////////////////////////////////////////////////////////////////////////////