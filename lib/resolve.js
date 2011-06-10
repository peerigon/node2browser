var currentModuleDir,
    modules;

function setCurrentModuleDir(newCurrentModuleDir) {
    currentModuleDir = newCurrentModuleDir;
}

function setModules(newModules) {
    modules = newModules;
}

function removeDotsFromPath(path) {
    var i,
        currentDir,
        result = [];
    
    path = path.split('/');
    for(i=0; i<path.length; i++) {
        currentDir = path[i];
        if(currentDir === '.') {
            continue;
        }
        if(currentDir === '..') {
            if(result.length === 0) {
                return undefined;
            }
            result.pop();
            continue;
        }
        result.push(currentDir);
    }
    
    return result.join('/');
}

function getLookUpPaths(path) {
    var currentDir,
        currentModuleDirArr,
        nodeModuleDirArr,
        lookUpPaths = [],
        i;
        
    function pushToLookUpPaths(path) {
        var currentDir = removeDotsFromPath(path);
        if(currentDir) {
            lookUpPaths.push(currentDir);
        }
    }
    
    if(path.charAt(0) === '.') {
        pushToLookUpPaths(currentModuleDir + '/' + path);
    } else if(path.charAt(0) === '/') {
        pushToLookUpPaths(path);
    } else {
        nodeModuleDirArr = currentModuleDir.match(/.*?node_modules/gi);
        if(nodeModuleDirArr) {
            for(i=nodeModuleDirArr.length-1; i>=0; i--) {
                currentDir = nodeModuleDirArr.join('') + '/' + path;
                pushToLookUpPaths(currentDir);
                nodeModuleDirArr.pop();
            }
        } else {
            currentModuleDirArr = currentModuleDir.split('/');
            for(i=currentModuleDirArr.length-1; i>=0; i--) {
                currentDir = currentModuleDirArr.join('/') + '/node_modules/' + path;
                pushToLookUpPaths(currentDir);
                currentModuleDirArr.pop();
            }
        }
    }
    
    return lookUpPaths;
}

function resolve(path) {
    var lookUpPaths = getLookUpPaths(path),
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
exports.removeDotsFromPath = removeDotsFromPath;
exports.getLookUpPaths = getLookUpPaths;
exports.resolve = resolve;