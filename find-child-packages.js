const fs = require('fs');
const util = require('util');
const path = require('path');
const loadJsonFile = require('load-json-file');
const glob = util.promisify(require('glob'));

const exists = util.promisify(fs.exists);

const PACKAGE_JSON_FILE = 'package.json';
const LERNA_CONFIG_FILE = 'lerna.json';

const flat = arrays => [].concat.apply([], arrays);

const distinct = array => [ ...new Set(array) ];

const findPatternMatches = async (root, pattern) => {
    if (pattern.includes('**')) return [];

    const matches = await glob(path.join(pattern, PACKAGE_JSON_FILE), {
        cwd: root
    });

    return matches.map(match => path.join(match, '..'));
};

const getLernaPackagesConfig = async root => {
    if (!(await exists(path.join(root, LERNA_CONFIG_FILE)))) {
        return [];
    }

    const config = await loadJsonFile(path.join(root, LERNA_CONFIG_FILE));
    return Array.isArray(config.packages) ? config.packages : [];
};

const getYarnWorkspacesConfig = async root => {
    if (!(await exists(path.join(root, PACKAGE_JSON_FILE)))) {
        return [];
    }

    const config = await loadJsonFile(path.join(root, PACKAGE_JSON_FILE));
    return Array.isArray(config.workspaces) ? config.workspaces : [];
};

const findChildPackages = async root => {
    const patterns = distinct([
        ...(await getLernaPackagesConfig(root)),
        ...(await getYarnWorkspacesConfig(root))
    ]);

    const matchesArr = await Promise.all(
        patterns.map(pattern => findPatternMatches(root, pattern))
    );

    return flat(matchesArr);
};

module.exports = { findChildPackages };
