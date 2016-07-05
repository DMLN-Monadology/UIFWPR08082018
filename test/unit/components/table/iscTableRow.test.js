(function(){
  'use strict';
  //console.log( 'iscTable Tests' );

  describe( 'iscTableRowCell', function(){
    var scope,
        rootScope,
        helper,
        rowScope,
        httpBackend,
        timeout,
        element,
        iscRowCtrl,
        state,
        $q,
        tableConfig;

    function mockApiCall(){
      var deferred = $q.defer();
      deferred.resolve();
      return deferred.promise;
    }


    function getTableConfig(){
      return {
        key           : 'LabOrders',
        title         : '',
        backButtonText: 'back',
        editable: true,

        columns: [
          {
            key  : 'OrderedItemDisplay',
            title: 'ISC_WELLNESS_LAB_NAME'
          },
          {
            key  : 'Timestamp',
            title: 'ISC_WELLNESS_LAB_DATE',
            type : 'date'
          },
          {
            type : 'commands',
            key  : '',
            title: 'Actions'
          } ],
        api    : {
          update: mockApiCall,
          remove: mockApiCall,
          create: mockApiCall
        }
      };
    }

    function getDataItems(){
      return [
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
    }

    var html = '<div isc-table-row ng-form name="iscRowForm"> </div>';

    useDefaultModules( 'isc.templates', 'isc.table' );

    beforeEach( inject( function( $rootScope, $compile, $httpBackend, $state, $timeout, _$q_ ){
      rootScope = $rootScope;

      $q = _$q_;

      scope = $rootScope.$new();

      scope.iscTblCtrl = { tableConfig: getTableConfig(), deleteRow: angular.noop,
        addRow: angular.noop, updateRow: angular.noop, editRow: angular.noop,
        createRow: angular.noop  };

      scope.dataItem = getDataItems()[ 0 ];   //mimicking ng-repeat

      state         = $state; 
      state.current = {
        name: 'tableTests'
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
        element    = $compile( html )( scope );
        scope.$digest();
        rowScope   = element.scope();
        iscRowCtrl = rowScope.iscRowCtrl;
      } )
    }

    // -------------------------
    describe( 'setup tests ', function(){

      it( "should have prototypally inherited from iscTable", function(){
        expect( rowScope.$parent ).toBe( scope );
      } );

      it ("should have iscRowCtrl point to iscTblCtrl", function(){
        expect( angular.isObject( iscRowCtrl.iscTblCtrl ) ).toBe( true );
      });

      it( "should have iscTblCtrl", function(){
        expect( angular.isObject( rowScope.iscTblCtrl ) ).toBe( true );
      } );

      it( "should have a iscRowCtrl", function(){
        expect( angular.isObject( rowScope.iscRowCtrl ) ).toBe( true );
      } );

      it( "should have a dataItem", function(){
        expect( angular.isObject( rowScope.dataItem ) ).toBe( true );
      } );

      it( "should have a iscRowForm", function(){
        expect( angular.isObject( rowScope.iscRowForm ) ).toBe( true );
      } );
    } );


    // -------------------------
    describe( 'iscRowCtrl onCommand calling apis tests ', function(){

      it( "should have a onCommand", function(){
        expect( angular.isFunction( iscRowCtrl.onCommand ) ).toBe( true );
      } );

      it( "should have called tableConfig.api.update", function(){
        iscRowCtrl.editModeData = angular.copy( rowScope.dataItem );
        iscRowCtrl.editModeData.modified = true;

        spyOn( scope.iscTblCtrl.tableConfig.api, 'update' ).and.callThrough();
        iscRowCtrl.onCommand( 'save' );

        expect( scope.iscTblCtrl.tableConfig.api.update ).toHaveBeenCalled();
      } );

      it( "should have called tableConfig.api.create", function(){
        rowScope.dataItem.isNew = true;
        iscRowCtrl.editModeData = angular.copy( rowScope.dataItem );
        iscRowCtrl.editModeData.modified = true;
        spyOn( scope.iscTblCtrl.tableConfig.api, 'create' ).and.callThrough();
        iscRowCtrl.onCommand( 'save' );

        expect( scope.iscTblCtrl.tableConfig.api.create ).toHaveBeenCalled();
      } );

      it( "should have called tableConfig.api.remove", function(){
        rowScope.dataItem.isNew = true;
        iscRowCtrl.editModeData = angular.copy( rowScope.dataItem );
        spyOn( scope.iscTblCtrl.tableConfig.api, 'remove' ).and.callThrough();
        iscRowCtrl.onCommand( 'remove' );

        expect( scope.iscTblCtrl.tableConfig.api.remove ).toHaveBeenCalled();
      } );

    } );

    // -------------------------
    describe( 'iscRowCtrl edit command', function(){
      it( "should have created a clone when editing", function(){
        iscRowCtrl.onCommand( 'edit' );

        expect( iscRowCtrl.editModeData ).toEqual( scope.dataItem );
        expect( iscRowCtrl.editModeData ).not.toBe( scope.dataItem );
      } );

      it( "should not be inEditMode by default", function(){
        expect( iscRowCtrl.inEditMode ).toEqual( false );
      } );

      it( "should have put the row inEditMode", function(){
        iscRowCtrl.onCommand( 'edit' );

        expect( iscRowCtrl.inEditMode ).toEqual( 'inline' );
      } );
    } );

  } );
})();