var assert = require('assert'),
    normalizePath = require('../../lib/normalizePath');

///////////////////////////////////////////////////////////////////////////////////////

assert.equal(normalizePath('aaa/bbb'), 'aaa/bbb');
assert.equal(normalizePath('aaa/bbb/'), 'aaa/bbb/');
assert.equal(normalizePath('./aaa'), 'aaa');
assert.equal(normalizePath('./aaa/'), 'aaa/');
assert.equal(normalizePath('././aaa'), 'aaa');
assert.equal(normalizePath('./aaa/bbb/../ccc'), 'aaa/ccc');
assert.equal(normalizePath('./aaa/bbb/ccc/ddd/../../../../eee'), 'eee');
assert.equal(normalizePath('aaa///bbb'), 'aaa/bbb');
assert.equal(normalizePath('aaa///bbb//'), 'aaa/bbb/');
assert.equal(normalizePath('../'), undefined);
assert.equal(normalizePath('aaa/bbb/../../../ccc'), undefined);