var getLookUpPaths = require('./getLookUpPaths'),
    normalizePath = require('./normalizePath');

var currentModuleDir,
    modules;

function setCurrentModuleDir(newCurrentModuleDir) {
    currentModuleDir = newCurrentModuleDir;
}

function setModules(newModules) {
    modules = newModules;
}

function resolve(path) {
    var lookUpPaths = getLookUpPaths(currentModuleDir, path),
        currentDir,
        currentDirWithExt,
        i;
    
    if(/\.node$/gi.test(path)) {
        throw new Error('resolve error: .node-files are not supported in the browser context.');
    }
    for(i=0; i<lookUpPaths.length; i++) {
        currentDir = lookUpPaths[i];
        if(/\.js$/gi.test(currentDir)) {
            if(modules.hasOwnProperty(currentDir)) {
               return currentDir;
            }
        } else {
            currentDirWithExt = currentDir + '.js';
            if(modules.hasOwnProperty(currentDirWithExt)) {
                return currentDirWithExt;
            }
            currentDirWithExt = normalizePath(
                currentDir + '/package.json'
            );
            if(modules.hasOwnProperty(currentDirWithExt)) {
                currentDirWithExt = modules[currentDirWithExt].main;
                if(currentDirWithExt.charAt('.')) {
                    currentDirWithExt = normalizePath(
                        currentModuleDir + '/' + currentDirWithExt
                    );
                }
                if(modules.hasOwnProperty(currentDirWithExt)) {
                    return currentDirWithExt;
                } else {
                    throw new Error('Cannot find module ' + currentDir);
                }
            }
            currentDirWithExt = currentDir + '/index.js';
            if(modules.hasOwnProperty(currentDirWithExt)) {
                return currentDirWithExt;
            }
        }
    }
    
    throw new Error('Cannot find module ' + path);
}

exports.setCurrentModuleDir = setCurrentModuleDir;
exports.setModules = setModules;
exports.resolve = resolve;