function Require(resolve, modules, requiringModules, modulePath) {

    this.resolve = resolve;

    return function require(path) {
        var resolved = resolve(path);

        if(requiringModules[resolved] && console && console.warn) {
            console.error('node2browser error: circular dependency detected.\n'
                + 'module ' + modulePath + ' is requiring ' + resolved + ' and vice versa.');

            return undefined;
        }
        requiringModules[modulePath] = true;
        initModule(resolved);
        delete requiringModules[modulePath];

        return modules[resolved];
    };
}

module.exports = Require;