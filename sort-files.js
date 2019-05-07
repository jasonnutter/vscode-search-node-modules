const sortFiles = (origFiles, origPriorities) => {
    const priorities = [ ...origPriorities ].reverse().map(p => p.toLowerCase());
    const files = origFiles.map(file => ({ original: file, lower: file.toLowerCase() }));
    const rank = file => priorities.indexOf(file) + 1;

    return files
        .sort((a, b) => rank(b.lower) - rank(a.lower))
        .map(file => file.original);
};

module.exports = { sortFiles };
