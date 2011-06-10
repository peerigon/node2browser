var Require = function Require(moduleDir) {
    var resolve = function resolve(path) {
        if(path.charAt(0) !== '/') {
            path = cwd + path;
        }
        
    };
    
    return function require(path) {
        if(path.charAt(0) === '/') {
            return modules[path];
        } else {
            
        }
    };
}