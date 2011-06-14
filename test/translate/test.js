var assert = require('assert'),
    translate = require('../../lib/translate'),
    setup = require('../../lib/setup'),
    vm = require('vm');
    
var sandbox,
    module1Path = require.resolve('./folder1/module1.js'),
    module2Path = require.resolve('./folder1/module2.js'),
    circular1Path = require.resolve('./folder1/circular1.js');

///////////////////////////////////////////////////////////////////////////////////////

function resetSandbox() {
    sandbox = {
        "console": console
    };
    
    sandbox.window = sandbox;
    vm.runInNewContext(setup, sandbox);
}

function start(testFunc) {
    setTimeout(testFunc, 0);
}

///////////////////////////////////////////////////////////////////////////////////////

resetSandbox();
assert.equal(typeof sandbox.global, 'object');
assert.equal(sandbox.global instanceof Object, false);

///////////////////////////////////////////////////////////////////////////////////////

function test1() {

    translate(
        module1Path,
        undefined,
        function result(err, src) {
            var module1;

            if(err) {throw err;}

            resetSandbox();
            vm.runInNewContext(src, sandbox);

            module1 = sandbox.modules[module1Path];
            assert.equal(module1(), 2);
            
            start(test2);
        }
    );
    
}
    
///////////////////////////////////////////////////////////////////////////////////////


function test2() {
    translate(
        module2Path,
        undefined,
        function result(err, src) {
            var module2;

            if(err) {throw err;}

            resetSandbox();
            vm.runInNewContext(src, sandbox);

            module2 = sandbox.modules[module2Path];
            assert.equal(module2(), 3);
            
            start(test3);
        }
    );
}
    
///////////////////////////////////////////////////////////////////////////////////////

function test3() {
    translate(
        circular1Path,
        undefined,
        function result(err, src) {
            if(err) {throw err;}
            resetSandbox();
            console.log('You should see an error msg now...');
            vm.runInNewContext(src, sandbox);
            
            start(test4);
        }
    );
}

///////////////////////////////////////////////////////////////////////////////////////

function test4() {
    translate(
        __dirname + '/folder1',
        undefined,
        function result(err, src) {
            if(err) {throw err;}
            resetSandbox();
            console.log('You should see an error msg now...');
            vm.runInNewContext(src, sandbox);
            
            start(test5);
        }
    );
}

///////////////////////////////////////////////////////////////////////////////////////

function test5() {
    console.log('TEST5========')
    translate(
        __dirname + '/folder2',
        undefined,
        function result(err, src) {
            if(err) {throw err;}
            resetSandbox();
            //console.log(src);
            vm.runInNewContext(src, sandbox);
            
            console.log('All tests ok');
        }
    );
}

///////////////////////////////////////////////////////////////////////////////////////

console.log('There should be an "All tests ok" at the end ...');
start(test1);