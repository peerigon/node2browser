var fs = require('fs'),
    pathUtil = require('path'),
    _ = require('underscore'),
    nodeResolve = require('./nodeResolve');
    Finder = require('fshelpers').Finder;
    
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
    var singleRequire = nodeResolve(path, path);
    
    if(result.indexOf(singleRequire) === -1) {
        result.push(singleRequire);
    }
}

function loadFiles(paths, loadedFiles, callback) {
    var requirements = [],
        pending = 0,
        i,
        path,
        reader = new Finder();
    
    function onFileLoaded(err, path, data) {
        var dir;
        
        if(err) {
            callback(err);
        }
        dir = pathUtil.dirname(path);
        loadedFiles[path] = data;
        try {
            if(pathUtil.extname(path) === '.js') {
                getModuleRequirements(data, dir, requirements);
            } else {
                getPackageRequirements(path, requirements);
            }
        } catch(e) {
            throw new Error('node2browser error while gathering required modules from ' + path + '\n' + e);
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
            reader.readFile(path, 'utf8', onFileLoaded);
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
        walker = new Finder();
        
    function onModulesLoaded(err, loadedFiles) {
        var result;
        
        if(!err) {
            result= assembleStrings(loadedFiles, pathModifier);
        }
        callback(err, result);
    }
    
    function onlyJSandJSON(fileName) {
        return pathUtil.extname(fileName) === '.js'
            || pathUtil.extname(fileName) === '.json';
    }
    
    if(!pathModifier) {
        pathModifier = _.identity;
    }
    
    walker.fileFilter = onlyJSandJSON;
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