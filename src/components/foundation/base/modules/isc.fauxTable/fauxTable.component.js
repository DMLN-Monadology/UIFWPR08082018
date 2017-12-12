/**
 * Created by hzou on 1/13/16.
 */

( function() {
  'use strict';

  /**
   * @ngdoc directive
   * @memberOf isc.fauxTable
   *
   * USAGE:
   **
   * //Client side paging below
   * <faux-table config="$ctrl.config" data="$ctrl.data"></faux-table>
   *
   * //Serverside paging
   * <faux-table config="$ctrl.config" data="$ctrl.data" results-available=$ctrl.resultsAvailable" server-paging="true"></faux-table>
   *
   *
   * @description
   * Configuration:
   *
   * {
   *   title   : 'Sortable table by fauxTable',
   *   sortable: true,
   *   pager  : {
   *     server      : true, //required for server side paging
   *     itemsPerPage: 2,
   *     onPageChange: function( page ) { //used with server side paging
   *       self.data = model.getData();
   *     }
   *   },
   *   columns : [
   *     { key: 'Salads', model: 'Salads', sortable: false },
   *     { key: 'Entrees', model: 'Entrees', type: 'string' },
   *     { key: 'Desserts', model: 'Desserts', cssTHClass: 'grid-block th', cssTDClass: 'grid-block td'  },
   *     { key: 'Soups', model: 'Soups' },
   *     { key: 'Customer', model: 'Customer.Name' },
   *     { key: 'Order Time', model: 'Customer.Date', type: 'date', onSort: function(data, column, direction){...} },
   *     { key: 'Age', model: 'Customer.DOB', type: 'integer', templateUrl: 'isc.fauxTable/cells/cell.age.html' }
   *   ]
   * }
   * @returns {{restrict: string, controller: controller, controllerAs: string, bindToController: {config: string, data: string}, scope: boolean, templateUrl: directive.templateUrl}}
   */
  angular.module( 'isc.fauxTable' )
    .component( 'fauxTable', {
      controller  : controller,
      controllerAs: 'fauxTblCtrl',
      require     : 'angularUtils.directives.dirPagination',
      bindings    : {
        config          : '=',
        data            : '=',
        resultsAvailable: '<'
      },
      templateUrl : /* @ngInject */ function( $attrs ) {
        if ( $attrs.templateUrl ) {
          return $attrs.templateUrl;
        } else {
          return $attrs.serverPaging ? 'isc.fauxTable/fauxTableServerPaging.html' : 'isc.fauxTable/fauxTable.html';
        }
      }
    } );

  /* @ngInject */
  function controller( devlog, $translate, $filter, paginationService ) {
    var log = devlog.channel( 'fauxTable' );

    var self = this;
    var pager;

    angular.extend( self, {
      $onChanges: $onChanges,

      sort           : sort,
      getSort        : getSort,
      getEmptyMessage: getEmptyMessage,

      changePageNumber: changePageNumber,
      currentPage     : 1
    } );

    function changePageNumber( page ) {
      log.logFn( 'changePageNumber' );
      if ( _.get( self, 'config.pager.server' ) ) {
        self.config.pager.onPageChange( page, self.sortBy, self.sortReverse );
      } else {
        self.currentPage = page;
      }
    }

    function $onChanges( changes ) {
      log.logFn( '$onChanges' );

      pager             = _.get( changes, 'config.pager', {} );
      self.paginationId = 'fauxTable_' + _.camelCase( _.get( self, 'config.title', '') );
      if ( pager.server && !pager.onPageChange ) {
        log.error( 'config.pager.onPageChange is required for server paging' );
      }
    }

    /**
     * Place the specified column as sort column
     * sortReverse: false => asc
     * sortReverse: true => desc
     * @param column
     *
     */
    function sort( column ) {
      if ( self.sortBy !== column ) {
        self.sortBy      = column;
        self.sortReverse = false;
      }
      else { //asc => desc
        self.sortReverse = !self.sortReverse;
      }

      if ( column.onSort ) {
        // call custom column sort
        column.onSort( self.data, column, self.sortReverse );
      }
      else {
        self.data = $filter( 'orderBy' )( self.data, column.model, self.sortReverse );
      }

      // Always reset the current page to 1 when sorting
      if ( _.get( self, 'config.pager.server' ) ) {
        // server-side paging requires manually invoking dir-pagination's service
        paginationService.setCurrentPage( self.paginationId, 1 );
      }
      else {
        self.currentPage = 1;
      }

    }

    /**
     * Gets the state of the sort for the specified column
     * @param column
     * @return null = not sorted, 'asc' = ascending, 'desc' = descending
     */
    function getSort( column ) {
      var sortState = null;
      if ( self.sortBy === column ) {
        sortState = self.sortReverse ? 'desc' : 'asc';
      }
      return sortState;
    }

    /*========================================
     =                 private               =
     ========================================*/

    /**
     * Gets the message to display (if any) when the collection is empty
     */
    function getEmptyMessage() {
      var configuredMessage = _.get( self, 'config.emptyText' );

      return configuredMessage === undefined ?
        $translate.instant( 'No Content Available' )
        : $translate.instant( configuredMessage );
    }
  }

} )();
