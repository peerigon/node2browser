var removeDotsFromPath = require('./removeDotsFromPath');

function getLookUpPaths(currentModuleDir, path) {
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

module.exports = getLookUpPaths;
