const path = require('path');

const sortFiles = (origFiles, origPriorities) => {
    const priorities = [ ...origPriorities ].reverse().map(p => p.toLowerCase());
    const files = origFiles.map(file => ({ original: file, lower: file.name.toLowerCase() }));
    const rank = file => priorities.indexOf(file) + 1;

    return files
        .sort((a, b) => rank(b.lower) - rank(a.lower))
        .map(({ original }) => original.isDirectory()
            ? `${original.name}${path.sep}`
            : original.name);
};

module.exports = { sortFiles };
