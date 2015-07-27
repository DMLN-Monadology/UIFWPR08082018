(function(){
  'use strict';
  //console.log( 'iscTable Tests' );

  describe( 'iscTableCell', function(){
    var rowScope,
        rootScope,
        helper,
        cellScope,
        httpBackend,
        timeout,
        element,
        columns,
        state;

    function getTableConfig(){
      return {
        key           : 'LabOrders',
        title         : '',
        backButtonText: 'back',

        columns: [
          {
            key  : 'OrderedItemDisplay',
            title: 'ISC_WELLNESS_LAB_NAME'
          },
          {
            key  : 'Timestamp',
            title: 'ISC_WELLNESS_LAB_DATE',
            type : 'date'
          } ]
      };
    }

    var commandColumn = {
      type : 'commands',
      key  : '',
      title: 'Actions'
    };

    var dataItems = [
      {
        "ResultValue"     : 141,
        "ResultValueUnits": "MEQ/L",
        "Test"            : "SODIUM"
      },
      {
        "ResultValue"     : 3.9,
        "ResultValueUnits": "MEQ/L",
        "Test"            : "POTASSIUM"
      }
    ];

    var html = '<div isc-table-cell ' +
      'cell-data="dataItem"' +
      'cell-config="column"' +
      'mobile-class="isc-text-item">' +
      '</div>';

    beforeEach( module( 'isc.common' ) );

    // this loads all the external templates used in directives etc
    // eg, everything in templates/**/*.html
    beforeEach( module( 'isc.templates' ) );

    // show $log statements
    beforeEach( module( function( $provide ){
      $provide.value( '$log', console );
    } ) );

    beforeEach( inject( function( $rootScope, $compile, $httpBackend, $state, $timeout ){
      rootScope = $rootScope;

      rowScope            = $rootScope.$new();
      rowScope.iscTblCtrl = { tableConfig: getTableConfig() };
      rowScope.iscRowCtrl = { inEditMode: false };

      rowScope.column   = rowScope.iscTblCtrl.tableConfig.columns[ 0 ];
      rowScope.dataItem = dataItems[ 0 ];
      cellScope         = rowScope.$new();

      state         = $state;
      state.current = {
        name: 'tableTests'
      };

      rowScope.backButtonCallback = function(){
      };

      rowScope.rowButtonCallback = function(){
      };

      httpBackend = $httpBackend;
      timeout     = $timeout;

      // dont worry about calls to assets
      httpBackend.when( 'GET', 'assets/i18n/en_US.json' )
        .respond( 200, {} );

      compile();
    } ) );

    function compile(){
      inject( function( $rootScope, $compile ){
        element   = $compile( html )( rowScope );
        rowScope.$digest();
        cellScope = element.scope();
      } )
    }

    // -------------------------
    describe( 'setup tests ', function(){

      it( "should have a column", function(){
        expect( angular.isObject( cellScope.column ) ).toBe( true );
      } );

      it( "should have dataItem", function(){
        expect( angular.isObject( cellScope.dataItem ) ).toBe( true );
      } );

      xit( "should have mobileClass", function(){
        expect( angular.isObject( cellScope.mobileClass ) ).toBe( true );
      } );

    } );

    // -------------------------
    describe( 'getTrClass tests ', function(){

      it( "should have a getTrClass", function(){
        expect( angular.isFunction( cellScope.getTrClass ) ).toBe( true );
      } );

      it( "should get the right class, no explicit className, no getter", function(){
        var expected = cellScope.getTrClass( {} );
        expect( expected ).toBe( '' );
      } );

      it( "should get the right class, WITH explicit className, no getter", function(){

        columns = [
          {
            key      : 'OrderedItemDisplay',
            title    : 'ISC_WELLNESS_LAB_NAME',
            className: 'some-class-name'
          },
          {
            key  : 'Timestamp',
            title: 'ISC_WELLNESS_LAB_DATE',
            type : 'date'
          }
        ];

        dataItems = [
          {
            "ResultValue"     : 141,
            "ResultValueUnits": "MEQ/L",
            "Test"            : "SODIUM"
          },
          {
            "ResultValue"     : 3.9,
            "ResultValueUnits": "MEQ/L",
            "Test"            : "POTASSIUM"
          }
        ];

        rowScope.column   = columns[ 0 ];
        rowScope.dataItem = dataItems[ 0 ];
        compile();

        var expected = cellScope.getTrClass( {} );
        expect( expected ).toBe( 'some-class-name' );
      } );

      it( "should get the right class, no explicit className, WITH getter", function(){

        rowScope.getClass = function(){
          return 'got-the-class'
        };

        columns = [
          {
            key        : 'OrderedItemDisplay',
            title      : 'ISC_WELLNESS_LAB_NAME',
            classGetter: rowScope.getClass
          },
          {
            key  : 'Timestamp',
            title: 'ISC_WELLNESS_LAB_DATE',
            type : 'date'
          }
        ];

        dataItems = [
          {
            "ResultValue"     : 141,
            "ResultValueUnits": "MEQ/L",
            "Test"            : "SODIUM"
          },
          {
            "ResultValue"     : 3.9,
            "ResultValueUnits": "MEQ/L",
            "Test"            : "POTASSIUM"
          }
        ];

        rowScope.column   = columns[ 0 ];
        rowScope.dataItem = dataItems[ 0 ];
        compile();

        var expected = cellScope.getTrClass( {} );
        expect( expected ).toBe( 'got-the-class' );
      } );
    } );


    // -------------------------
    describe( 'getDisplayText tests ', function(){

      it( "should have a getDisplayText", function(){
        expect( angular.isFunction( cellScope.getDisplayText ) ).toBe( true );
      } );

      it( "should get the right displayText, getter function", function(){

        var dataItem    = 'shazam';
        var defaultText = 1234;

        rowScope.column = {
          key       : 'OrderedItemDisplay',
          title     : 'ISC_WELLNESS_LAB_NAME',
          textGetter: function(){
            return 'foo bar baz';
          }
        };
        compile();

        var expected = cellScope.getDisplayText( dataItem, defaultText );
        expect( expected ).toBe( 'foo bar baz' );
      } );

      it( "should get the right displayText, neither defined", function(){

        var dataItem    = '';
        var defaultText = '';

        var expected = cellScope.getDisplayText( dataItem, defaultText );
        expect( expected ).toBe( 'ISC_NA' );
      } );

      it( "should get the right displayText, dataItem defined, string", function(){

        var dataItem    = 'shazam';
        var defaultText = '';

        var expected = cellScope.getDisplayText( dataItem, defaultText );
        expect( expected ).toBe( dataItem );
      } );

      it( "should get the right displayText, dataItem defined, number", function(){

        var dataItem    = 0;
        var defaultText = '';

        var expected = cellScope.getDisplayText( dataItem, defaultText );
        expect( expected ).toBe( '0' );
      } );

      it( "should get the right displayText, defaultText defined, string", function(){

        var dataItem    = '';
        var defaultText = 'shazam';

        var expected = cellScope.getDisplayText( dataItem, defaultText );
        expect( expected ).toBe( 'shazam' );
      } );

      it( "should get the right displayText, defaultText defined, number", function(){

        var dataItem    = '';
        var defaultText = 1234;

        var expected = cellScope.getDisplayText( dataItem, defaultText );
        expect( expected ).toBe( '1234' );
      } );

      it( "should get the right displayText, BOTH defined", function(){

        var dataItem = 'shazam'; // dataItem should take presidence
        var defaultText = 1234;

        var expected = cellScope.getDisplayText( dataItem, defaultText );
        expect( expected ).toBe( 'shazam' );
      } );
    } );

    // -------------------------
    describe( ' dom inspection tests', function(){
      describe( 'with command column', function(){

        it( 'should have edit/remove buttons', function(){
          rowScope.column = commandColumn;
          compile();

          var editButton   = element.find( ".isc-table-command-edit-icon" );
          var removeButton = element.find( ".isc-table-command-remove-icon" );
          var saveButton   = element.find( ".isc-table-command-save-icon" );
          var cancelButton = element.find( ".isc-table-command-cancel-icon" );

          expect( editButton.length ).toBe( 1 );
          expect( removeButton.length ).toBe( 1 );
          expect( saveButton.length ).toBe( 0 );
          expect( cancelButton.length ).toBe( 0 );
        } );

        it( 'should have save/cancel buttons', function(){
          rowScope.column                = commandColumn;
          rowScope.iscRowCtrl.inEditMode = true;
          compile();

          var editButton   = element.find( ".isc-table-command-edit-icon" );
          var removeButton = element.find( ".isc-table-command-remove-icon" );
          var saveButton   = element.find( ".isc-table-command-save-icon" );
          var cancelButton = element.find( ".isc-table-command-cancel-icon" );

          expect( editButton.length ).toBe( 0 );
          expect( removeButton.length ).toBe( 0 );
          expect( saveButton.length ).toBe( 1 );
          expect( cancelButton.length ).toBe( 1 );
        } );
      } );
    } );

    // -------------------------
    describe( 'notThere tests ', function(){

      it( "should have a notThere", function(){
        expect( angular.isFunction( cellScope.notThere ) ).toBe( true );
      } );

      it( "should know if something isnt there", function(){
        var expected = cellScope.notThere( 0 );
        expect( expected ).toBe( false );

        var expected = cellScope.notThere( 'some string' );
        expect( expected ).toBe( false );

        var expected = cellScope.notThere( '' );
        expect( expected ).toBe( true );

        var expected = cellScope.notThere( null );
        expect( expected ).toBe( true );

        var expected = cellScope.notThere( false );
        expect( expected ).toBe( true );
      } );
    } );

  } );
})();

