const fs = require('fs');
const util = require('util');
const path = require('path');

const glob = util.promisify(require('glob'));

const exists = util.promisify(fs.exists);
const readFile = util.promisify(fs.readFile);

const flat = arrays => [].concat.apply([], arrays);

const findLernaPackageDirs = async root => {
    const LERNA_CONFIG_FILE = 'lerna.json';
    if (await exists(path.join(root, LERNA_CONFIG_FILE))) {
        const data = await readFile(path.join(root, LERNA_CONFIG_FILE));

        const config = JSON.parse(data);
        const packagesConfig = config.packages || [];

        const matches = flat(
            await Promise.all(
                packagesConfig.map(pattern => {
                    if (pattern.includes('**')) return [];
                    return glob(path.join(pattern, '/package.json'), { cwd: root });
                })
            )
        );

        return [ ...matches.map(match => path.join(match, '..')) ];
    }
    return [];
};

module.exports = { findLernaPackageDirs };
