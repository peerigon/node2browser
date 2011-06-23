var translate = require('../../lib/translate');

var sandbox,
    consoleMsg,
    module1Path = __dirname + '/folder1/module1.js',
    module2Path = __dirname + '/folder1/module2.js',
    circular1Path = __dirname + '/folder1/circular1.js',
    folder1 = [
        module1Path,
        module2Path,
        circular1Path,
        __dirname + '/folder1/circular2.js',
        __dirname + '/folder1/main.js'
    ],
    otherModulePath = __dirname + '/folder2/otherModule1.js',
    folder3Index = __dirname + '/folder3/index.js',
    folder4 = [
        __dirname + '/node_modules/folder4/module1.js',
        __dirname + '/node_modules/folder4/module2.js'
    ],
    browserModules = [
        __dirname + '/browser/node_modules/folder1/module1.js',
        __dirname + '/browser/node_modules/folder1/package.json',
        __dirname + '/browser/node_modules/folder2/module2.js',
        __dirname + '/browser/node_modules/test.js'
    ];

console.time('hallo');
translate(otherModulePath, undefined, function(err, result) {
    console.timeEnd('hallo');

console.log('ende');
});