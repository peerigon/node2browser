var getLookUpPaths = require('./getLookUpPaths'),
    pathUtil = require('path');

function resolve(currentModulePath, pathToResolve, callback) {
    var lookUpPaths,
        currentPath,
        i=0;

    function loop() {
        if (i < lookUpPaths.length) {
            currentPath = lookUpPaths[i];
            if (/\.js$/i.test(currentPath)) {
                check(currentPath, loop);
            } else {
                check(currentPath + '.js', checkPackageJSON);
            }
        } else {
            callback(new Error('Cannot find module ' + pathToResolve + ' required in ' + currentModulePath));
        }
        i++;
    }

    function check(path, onError) {
        path = pathUtil.normalize(path);
        pathUtil.exists(path, function existsResult(result) {
            if (result) {
                callback(null, path);
            } else {
                onError();
            }
        });
    }

    function checkPackageJSON() {
        check(currentPath + '/package.json', checkIndexJS);
    }

    function checkIndexJS() {
        check(currentPath + '/index.js', loop);
    }

    if (/\.node$/i.test(pathToResolve)) {
        callback(new Error('resolve error in ' + currentModulePath + ': .node-files are not supported in the browser context.'));
    } else {
        lookUpPaths = getLookUpPaths(pathUtil.dirname(currentModulePath), pathToResolve);
        loop();
    }
}

module.exports = resolve;