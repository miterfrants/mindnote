const frontEndRootPath = __dirname.substring(0, __dirname.lastIndexOf('/') + 1) + 'front-end/';
const aliases = [{
    sourcePath: /^\/mindnote\//gi,
    destinationPath: frontEndRootPath
}];

module.exports = {
    frontEndRootPath,
    aliases,
    frontEndConfigPath: process.env.NODE_ENV === 'prod' ? '/config.js' : '/config.dev.js',
    relativeFrontEndURL: process.env.NODE_ENV === 'prod' ? 'http://127.0.0.1/' : 'https://127.0.0.1/'
}