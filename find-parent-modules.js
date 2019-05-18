const fs = require('fs');
const path = require('path').posix;
const util = require('util');

const fsExists = util.promisify(fs.exists);
const fsReaddir = util.promisify(fs.readdir);

// Looks for node_modules in parent folders of the workspace recursively.
// Returns a list of paths relative to workspaceRoot/nodeModulesPath
const findParentModules = async (workspaceRoot, nodeModulesPath) => {
    const absoluteRootNodeModules = path.join('/', nodeModulesPath);

    const find = async dir => {
        const ret = [];
        if (await fsExists(dir)) {
            const getFilePath = file =>
                path.relative(path.join(workspaceRoot, nodeModulesPath), path.join(dir, file));

            const dirFiles = await fsReaddir(dir);
            ret.push(...dirFiles.map(getFilePath));
        }

        if (dir !== absoluteRootNodeModules) {
            const parent = path.join(dir, '..', '..', nodeModulesPath);
            ret.push(...(await find(parent)));
        }

        return ret;
    };

    return find(path.join(workspaceRoot, '..', nodeModulesPath));
};

module.exports = {
    findParentModules
};
