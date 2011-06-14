var assert = require('assert'),
    translate = require('../../lib/translate'),
    setup = require('../../lib/setup'),
    fs = require('fs'),
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
        __dirname + '/folder1',
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
        __dirname + '/folder2',
        undefined,
        function result(err, src) {
            if(err) {throw err;}
            resetSandbox();
            vm.runInNewContext(src, sandbox);
            
            start(test5);
        }
    );
}

///////////////////////////////////////////////////////////////////////////////////////

function test5() {
    var times = 0;
    
    function finished(err, src) {
        if(err) {throw err;}
        vm.runInNewContext(src, sandbox);
        times++;
        if(times === 3) {
            start(test6);
        }
    }
    
    resetSandbox();
    console.log('You should see an error msg now...');
    translate(__dirname + '/folder1', undefined, finished);
    translate(__dirname + '/folder2', undefined, finished);
    translate(__dirname + '/folder3', undefined, finished);
}

///////////////////////////////////////////////////////////////////////////////////////

function test6() {
    var times = 0;
    
    function finished(err, src) {
        if(err) {throw err;}
        vm.runInNewContext(src, sandbox);
        times++;
        if(times === 2) {
            start(test7);
        }
    }
    
    function pathModifier(path) {
        if(path.charAt(0) === '.') {
            return path;
        } else {
            return '/node_modules/' + path.replace(/.*node_modules\//gi, '');
        }
    }
    
    resetSandbox();
    translate(__dirname + '/folder3', pathModifier, finished);
    translate(__dirname + '/node_modules/folder4', pathModifier, finished);
}

///////////////////////////////////////////////////////////////////////////////////////

function test7() {
    var times = 0,
        allModulesSrc = setup;
    
    function finished(err, src) {
        if(err) {throw err;}
        allModulesSrc += src;
        times++;
        if(times === 4) {
            allModulesSrc = 'console.log("You should see an error msg now...");'
                + allModulesSrc;
            fs.writeFileSync('./browser/modules.js', allModulesSrc, 'utf8');
            console.log('All tests ok');
        }
    }
    
    function pathModifier(path) {
        if(path.charAt(0) === '.') {
            return path;
        } else {
            return '/node_modules/' + path.replace(/.*node_modules\//gi, '');
        }
    }
    
    resetSandbox();
    translate(__dirname + '/folder1', pathModifier, finished);
    translate(__dirname + '/folder2', pathModifier, finished);
    translate(__dirname + '/folder3', pathModifier, finished);
    translate(__dirname + '/node_modules/folder4', pathModifier, finished);
}

///////////////////////////////////////////////////////////////////////////////////////

console.log('There should be an "All tests ok" at the end ...');
start(test1);