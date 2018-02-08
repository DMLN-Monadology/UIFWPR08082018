var tar    = require( '../build-dependencies/tar' );
const argv = require( '../build-dependencies/minimist' )( process.argv.slice( 2 ) );
console.log( 'In Unpack.js' );
console.log( 'Source:',  argv.source);
console.log( 'Target:',  argv.target);

try {
  console.log( 'Start to unpack!' );
  tar.x(
    {
      file: argv.source,
      C   : argv.target,
      sync: true
    }
  );
  console.log( 'End unpack!' );
  process.exit( 0 );
}
catch ( error ) {
  console.log( 'Unpack fail, reason: ', error );
  process.exit( 1 );
}
