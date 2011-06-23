var getLookUpPaths = require('./getLookUpPaths');

function resolve(currentModuleDir, path) {
    var lookUpPaths,
        currentDir,
        i;

    if(/\.node$/gi.test(path)) {
        throw new Error('node2browser error: .node-files are not supported in the browser context.');
    }

    // by deleting the "/package.json"-ending require.resolve will parse
    // the JSON and look for the main attribute.
    path = path.replace(/\/package\.json$/g, '');

    lookUpPaths = getLookUpPaths(currentModuleDir, path);

    for(i=0; i<lookUpPaths.length; i++) {
        currentDir = lookUpPaths[i];
        try {
            currentDir = require.resolve(currentDir);
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