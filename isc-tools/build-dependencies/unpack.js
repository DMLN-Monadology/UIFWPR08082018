var tar = require('../build-dependencies/tar');
const argv = require('../build-dependencies/minimist')(process.argv.slice(2));

tar.x(
  {
    file: argv.source,
    C: argv.target
  }
);

