var fs = require('fs'),
    _ = require('underscore'),
    resolve = require('./browserResolve').resolve,
    removeDotsFromPath = require('./removeDotsFromPath'),
    getLookUpPaths = require('./getLookUpPaths');

var _setup,
    _require;

var resolveFunctions = removeDotsFromPath.toString()
        + getLookUpPaths.toString()
        + resolve.toString(),
    requireFunc;
        
_require = require.resolve('../template/require.ejs');
_require = fs.readFileSync(_require, 'utf8');
_require = _.template(_require);
requireFunc = _require({
    resolveFunctions: resolveFunctions
});

_setup = require.resolve('../template/setup.ejs');
_setup = fs.readFileSync(_setup, 'utf8');
_setup = _.template(_setup);
_setup = _setup({
    requireFunc: requireFunc
});

module.exports = _setup;
