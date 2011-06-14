var getLookUpPaths = require('./getLookUpPaths');

function resolve(currentModuleDir, path) {
    var lookUpPaths = getLookUpPaths(currentModuleDir, path),
        currentDir,
        i;
    
    if(/\.node$/gi.test(path)) {
        throw new Error('node2browser error: .node-files are not supported in the browser context.');
    }
    for(i=0; i<lookUpPaths.length; i++) {
        currentDir = lookUpPaths[i];
        try {
            currentDir = require.resolve(lookUpPaths[i]);
            break;
        } catch(e) {
            if(i<lookUpPaths.length - 1) {
                continue;
            }
        }
        try {
            currentDir = require.resolve(path);
        } catch(e) {
            throw e;
        }
    }
    
    return currentDir;
}

module.exports = resolve;