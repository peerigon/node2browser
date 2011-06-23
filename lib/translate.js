var fs = require('fs'),
    pathUtil = require('path'),
    _ = require('underscore'),
    async = require('async'),
    getDependencies = require('./getDependencies');

var _module,
    _modules,
    requireRegEx = /=( *)require\(['"](.*)['"]\)/g;

function loadFiles(filesToLoad, finalCallback) {
    var loadedFiles = {},
        pending = 0,
        isFilesToLoadRunning = false;

    function loadFile(path, callback) {
        function finished(err) {
            pending--;
            if (!isFilesToLoadRunning) {
                processFilesToLoad();
            }
            callback(err || null);
        }

        pending++;
        async.waterfall([
            async.apply(fs.readFile, path, 'utf8'),
            function processData(data, callback) {
                loadedFiles[path] = data;
                removeFromFilesToLoad(path);
                getDependencies(path, data, callback);
            },
            function processDeps(deps, callback) {
                var i;

                for (i in deps) {
                    pushToFilesToLoad(deps[i]);
                }

                callback();
            }
        ], finished);
    }

    function pushToFilesToLoad(path) {
        if (loadedFiles[path] === undefined
            && filesToLoad.indexOf(path) === -1) {
            filesToLoad.push(path);
        }
    }

    function removeFromFilesToLoad(path) {
        filesToLoad.splice(filesToLoad.indexOf(path), 1);
    }

    function processFilesToLoad() {
        function finished(err) {
            if (err) {
                finalCallback(err);
            } else if (pending === 0) {
                finalCallback(null, loadedFiles);
            }
        }

        async.forEach(
            filesToLoad,
            loadFile,
            finished
        );
    }

    processFilesToLoad();
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

    modulesStr = _modules({
        modules: modulesStr
    });

    return modulesStr;
}

function translate(paths, pathModifier, callback) {
    function onFilesLoaded(err, loadedFiles) {
        var result;

        if(!err) {
            result = assembleStrings(loadedFiles, pathModifier);
        }
        callback(err, result);
    }

    if (!pathModifier) {
        pathModifier = _.identity;
    }
    if (typeof paths === 'string') {
        paths = [paths];
    } else {
        paths = paths.slice();  // creating independent copy
    }
    loadFiles(paths, onFilesLoaded);
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