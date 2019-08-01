const frontEndRootPath = __dirname.substring(0, __dirname.lastIndexOf('/') + 1) + 'front-end/';
const aliases = [{
    sourcePath: /^\/mindnote\//gi,
    destinationPath: frontEndRootPath
}];

module.exports = {
    frontEndRootPath,
    aliases
}