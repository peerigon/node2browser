var fs = require('fs'),
    pathUtil = require('path'),
    _ = require('underscore'),
    nodeResolve = require('./nodeResolve');
    FileWalker = require('FileWalker');
    
var _module,
    _modules;

var requireRegEx = /=( *)require\(['"](.*)['"]\)/g;

function getModuleRequirements(content, dir, result) {
    var matches,
        i,
        j,
        singleRequire;
    
    matches = content
        .match(requireRegEx);  // extracting all require statements
        
    if(matches) {
        for(i=0; i<matches.length; i++) {
            singleRequire = matches[i];
            singleRequire = singleRequire
                .replace(/^= *require\(['"]/, '') // removes leading require('
                .replace(/['"]\)$/, ''); // removes trailing ')
            singleRequire = nodeResolve(dir, singleRequire);
            if(result.indexOf(singleRequire) === -1) {
                result.push(singleRequire);
            }
        }
    }
}

function getPackageRequirements(path, result) {
    var singleRequire = nodeResolve(path);
    
    console.log('package requirment', singleRequire);
    
    if(result.indexOf(singleRequire) === -1) {
        result.push(singleRequire);
    }
}

function loadFiles(paths, loadedFiles, callback) {
    var requirements = [],
        pending = 0,
        path,
        i;
    
    function onFileLoaded(err, data, path) {
        var dir = pathUtil.dirname(path);
        
        if(err) {
            callback(err);
        }
        loadedFiles[path] = data;
        if(pathUtil.extname(path) === '.js') {
            try {
                getModuleRequirements(data, dir, requirements);
            } catch(e) {
                throw new Error('node2browser error while gathering required modules from ' + path + '\n' + e);
            }
        } else {
            getPackageRequirements(path, requirements);
        }
        pending--;
        done();
    }
    
    function done() {
        if(pending === 0) {
            if(requirements.length === 0) {
                callback(undefined, loadedFiles);
            } else {
                loadFiles(requirements, loadedFiles, callback);
            }
        }
    }
    
    for(i=0; i<paths.length; i++) {
        path = paths[i];
        if(loadedFiles[path]) {
            continue;
        } else {
            pending++;
            fs.readFile(path, 'utf8', function(err, data) {
                onFileLoaded(err, data, path);
            });
        }
    }
    
    done();
}

function assembleStrings(loadedFiles, pathModifier) {
    var modulesStr = '',
        currentDirName,
        currentFileName;
        
    _(loadedFiles).each(function eachModule(content, path) {
        currentFileName = pathModifier(path);
        currentDirName = pathUtil.dirname(currentFileName);
        if(pathUtil.extname(path) === '.js') {
            content = content.replace(requireRegEx, function(match, whiteSpaces, path) {
                return '=' + whiteSpaces + 'require(\'' + pathModifier(path) + '\')';
            });
            modulesStr += _module({
                fileName: currentFileName,
                dirName: currentDirName,
                moduleContent: content
            });
        } else {
            modulesStr += _package({
                fileName: currentFileName,
                packageContent: content
            });
        }
    });
    
    modulesStr += _modules();
    
    return modulesStr;
}

function translate(path, pathModifier, callback) {
    var modules = [],
        walker = new FileWalker();
        
    function onModulesLoaded(err, loadedFiles) {
        if(err) {
            callback(err);
        } else {
            callback(
                undefined,
                assembleStrings(loadedFiles, pathModifier)
            );
        }
    }
    
    if(!pathModifier) {
        pathModifier = _.identity;
    }
    
    walker.fileFilter = function onlyJSandJSON(fileName) {
        return pathUtil.extname(fileName) === '.js'
            || pathUtil.extname(fileName) === '.json';
    };
    walker
        .on('file', function(path) {
            modules.push(path);
        })
        .on('end', function() {
            loadFiles(modules, {}, onModulesLoaded);
        })
        .walk(path);
}

_module = require.resolve('../template/module.ejs');
_module = fs.readFileSync(_module, 'utf8');
_module = _.template(_module);

_package = require.resolve('../template/package.ejs');
_package = fs.readFileSync(_package, 'utf8');
_package = _.template(_package);

_modules = require.resolve('../template/modules.ejs');
_modules = fs.readFileSync(_modules, 'utf8');
_modules = _.template(_modules);

module.exports = translate;