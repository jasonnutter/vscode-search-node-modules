const fs = require('fs');
const util = require('util');
const path = require('path');
const loadJsonFile = require('load-json-file');
const glob = util.promisify(require('glob'));
const { showWarning } = require('./utils');

const exists = util.promisify(fs.exists);

const PACKAGE_JSON_FILE = 'package.json';
const LERNA_CONFIG_FILE = 'lerna.json';
const DOUBLE_STAR = '**'; // globstar

const flat = arrays => [].concat.apply([], arrays);

const distinct = array => [ ...new Set(array) ];

const findPatternMatches = async (root, pattern) => {
    // patterns with double star e.g. '/src/**/' are not supported at the moment, because they are too general and may match nested node_modules
    if (pattern.includes(DOUBLE_STAR)) return [];

    const matches = await glob(path.join(pattern, PACKAGE_JSON_FILE), {
        cwd: root
    });

    return matches.map(match => path.join(match, '..'));
};

const getLernaPackagesConfig = async root => {
    const lernaConfigFile = path.join(root, LERNA_CONFIG_FILE);
    if (!(await exists(lernaConfigFile))) {
        return [];
    }

    const config = await loadJsonFile(lernaConfigFile).catch(() =>
        showWarning(`Ignoring invalid ${LERNA_CONFIG_FILE} file at: ${lernaConfigFile}`)
    );
    return config && Array.isArray(config.packages) ? config.packages : [];
};

const getYarnWorkspacesConfig = async root => {
    const packageJsonFile = path.join(root, PACKAGE_JSON_FILE);
    if (!(await exists(packageJsonFile))) {
        return [];
    }

    const config = await loadJsonFile(packageJsonFile).catch(() =>
        showWarning(`Ignoring invalid ${PACKAGE_JSON_FILE} file at: ${packageJsonFile}`)
    );
    return config && Array.isArray(config.workspaces) ? config.workspaces : [];
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
