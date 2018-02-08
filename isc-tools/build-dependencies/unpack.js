var tar    = require( '../build-dependencies/tar' );
const argv = require( '../build-dependencies/minimist' )( process.argv.slice( 2 ) );
console.log( 'Start to Unpack' );

try {
  tar.x(
    {
      file: argv.source,
      C   : argv.target,
      sync: true
    }
  );
  console.log( 'Unpack Success' );
  process.exit( 0 );
}
catch ( error ) {
  console.log( 'Unpack Fail, Reason: ', error );
  process.exit( 1 );
}
