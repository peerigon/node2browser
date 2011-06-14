var assert = require('assert'),
    removeDotsFromPath = require('../../lib/removeDotsFromPath');

///////////////////////////////////////////////////////////////////////////////////////

assert.equal(removeDotsFromPath('./aaa'), 'aaa');
assert.equal(removeDotsFromPath('./aaa/'), 'aaa/');
assert.equal(removeDotsFromPath('././aaa'), 'aaa');
assert.equal(removeDotsFromPath('aaa/bbb'), 'aaa/bbb');
assert.equal(removeDotsFromPath('./aaa/bbb/../ccc'), 'aaa/ccc');
assert.equal(removeDotsFromPath('./aaa/bbb/ccc/ddd/../../../../eee'), 'eee');
assert.equal(removeDotsFromPath('../'), undefined);
assert.equal(removeDotsFromPath('aaa/bbb/../../../ccc'), undefined);