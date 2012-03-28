var initializedModules,
    modules;

function initModule(modulePath) {
    var module = modules[modulePath],
        resolve,
        require;

    if (module === undefined && console && console.error) {
        console.error('Cannot initialize unknown module ' + modulePath);
    } else if (modulePath.search(/\.js$/gi) !== -1
        && initializedModules[modulePath] === undefined) {
        resolve = new Resolve(modules, modulePath);
        require = new Require(resolve, modules, requiringModules, initializedModules, modulePath);
        modules[modulePath] = module(require);
        initializedModules[modulePath] = true;
    } else if(modulePath.search(/\.json$/gi) !== -1
        && initializedModules[modulePath] === undefined) {
        resolve = new Resolve(modules, modulePath);
        initModule(resolve(module.main));
        initializedModules[modulePath] = true;
    }
}

module.exports = initModule;