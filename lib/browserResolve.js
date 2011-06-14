var getLookUpPaths = require('./getLookUpPaths');

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
        currentDirWithExtension,
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
            currentDirWithExtension = currentDir + '.js';
            if(modules.hasOwnProperty(currentDirWithExtension)) {
                return currentDirWithExtension;
            }
            currentDirWithExtension = currentDir + '/package.json';
            if(modules.hasOwnProperty(currentDirWithExtension)) {
                currentDirWithExtension = modules[currentDirWithExtension].main;
                currentDirWithExtension = removeDotsFromPath(currentDirWithExtension);
                if(modules.hasOwnProperty(currentDirWithExtension)) {
                    return currentDirWithExtension;
                } else {
                    throw new Error('Cannot find module ' + currentDir);
                }
            }
            currentDirWithExtension = currentDir + '/index.js';
            if(modules.hasOwnProperty(currentDirWithExtension)) {
                return currentDirWithExtension;
            }
        }
    }
    
    throw new Error('Cannot find module ' + path);
}

exports.setCurrentModuleDir = setCurrentModuleDir;
exports.setModules = setModules;
exports.resolve = resolve;