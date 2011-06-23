var testCase = require('nodeunit').testCase,
    translate = require('../../lib/translate'),
    setup = require('../../lib/setup'),
    pathUtil = require('path'),
    http = require('http'),
    fs = require('fs'),
    vm = require('vm');

///////////////////////////////////////////////////////////////////////////////////////

var sandbox,
    consoleMsg,
    module1Path = require.resolve('./folder1/module1.js'),
    module2Path = require.resolve('./folder1/module2.js'),
    circular1Path = require.resolve('./folder1/circular1.js');

function run(src, modulePath) {
    src = setup(src, modulePath);
    //console.log(src);
    vm.runInNewContext(src, sandbox);
}

function consoleWrapper(txt) {
    consoleMsg = txt;
    //console.log(txt);
}

module.exports = testCase({
    setUp: function(finished) {
        sandbox = {
            console: {
                warn: consoleWrapper,
                error: consoleWrapper,
                log: consoleWrapper
            }
        };

        sandbox.window = sandbox;
        consoleMsg = undefined;
        finished();
    },
    simpleModule: function(test) {
        test.expect(1);
        translate(
            module1Path,
            undefined,
            function result(err, src) {
                var module1;

                if(err) {throw err;}
                run(src, module1Path);
                module1 = sandbox.modules[module1Path];
                test.equal(module1(), 2);
                test.done();
            }
        );
    },
    singleRequirement: function(test) {
        test.expect(1);
        translate(
            module2Path,
            undefined,
            function result(err, src) {
                var module2;

                if(err) {throw err;}
                run(src, module2Path);
                module2 = sandbox.modules[module2Path];
                test.equal(module2(), 3);
                test.done();
            }
        );
    },
    unknownInitModule: function(test) {
        test.expect(1);
        translate(
            __dirname + '/folder1',
            undefined,
            function result(err, src) {
                if(err) {throw err;}
                run(src, __dirname + '/folder1');
                test.equal(consoleMsg, 'Cannot initialize unknown module ' + __dirname + '/folder1');
                test.done();
            }
        );
    },
    circularDependency: function(test) {
        test.expect(1);
        translate(
            __dirname + '/folder1',
            undefined,
            function result(err, src) {
                if(err) {throw err;}
                run(src, __dirname + '/folder1/circular1.js');
                test.equal(
                    consoleMsg,
                    'node2browser error: circular dependency detected.\n'
                        + 'module ' + __dirname + '/folder1/circular2.js is requiring '
                        + __dirname + '/folder1/circular1.js and vice versa.'
                    );
                test.done();
            }
        );
    },
    packageJSON: function(test) {
        test.expect(1);
        translate(
            __dirname + '/folder2',
            undefined,
            function result(err, src) {
                var main = __dirname + '/folder1/main.js';

                if(err) {throw err;}
                run(src, __dirname + '/folder2/package.json');
                main = sandbox.modules[main];
                test.equal(main.module1(), 2);
                test.done();
            }
        );
    },
    withPathModifier: function(test) {
        function finished(err ,src) {
            var module1 = '/node_modules/folder4/module1.js';

            if(err) {throw err;}
            run(src, module1);
            module1 = sandbox.modules[module1];
            test.equal(consoleMsg, undefined);
            test.equal(module1, 'module2');
            test.done();
        }

        function pathModifier(path) {
            if(path.charAt(0) === '.') {
                return path;
            } else {
                return '/node_modules/' + path.replace(/.*node_modules\//gi, '');
            }
        }

        test.expect(2);
        translate(__dirname + '/node_modules/folder4', pathModifier, finished);
    },
    writingBrowserTest: function(test) {
        var nodeUnitPath = pathUtil.dirname(require.resolve('nodeunit')) + '/examples/browser/nodeunit.js',
            nodeUnit = fs.readFileSync(nodeUnitPath, 'utf8');

        function finished(err, src) {
            var testModule = '/node_modules/test.js';

            if(err) {throw err;}
            run(src, testModule);
            src = setup(src, testModule);
            src = nodeUnit + src;
            fs.writeFileSync(__dirname + '/browser/modules.js', src, 'utf8');
            test.done();
        }

        function pathModifier(path) {
            if(path.charAt(0) === '.') {
                return path;
            } else {
                return '/node_modules/' + path.replace(/.*node_modules\//gi, '');
            }
        }

        translate(__dirname + '/browser/node_modules', pathModifier, finished);
    }
});