/**
 * Created by hzou on 07/13/15.
 */

/**
 * When using rowTemplate, DO NOT put html comments in it.
 * this will cause duplicate renderers when used together with ng-repeat
 */

/**
 * if custom rowTemplate is defined in tabeConfig, it will use rowTemplate instead of default template
 *** if rowType === 'data'
 *
 * if custom addTemplate is defined in tabeConfig, it will use rowTemplate instead of default template
 *** if rowType === 'add'
 */
(function(){
  'use strict';

  iscTableRow.$inject = [ '$log', 'devlog', '$state', '$templateCache', '$compile' ];

  function iscTableRow( $log, devlog, $state, $templateCache, $compile ){
    //$log.debug('iscTableRow.LOADED');

    // ----------------------------
    // vars
    // ----------------------------

    // ----------------------------
    // class factory
    // ----------------------------

    var directive = {
      scope       : true, //prototypal inheritance
      restrict    : 'A',
      //needs to be -1 in order to have access to dataItem, which is populated by the dir-pagination directive
      priority    : -1,
      controllerAs: 'iscRowCtrl',
      controller  : "iscTableRowController",
      compile     : compile
    };

    return directive;

    function compile(){

      return {
        pre : pre,
        post: post
      };

      function pre(scope, trElem, attrs, iscRowCtrl){
        var defaultTemplate = scope.iscTblCtrl.tableConfig.editable === 'popup' ? "table/popup/iscTablePopupRow.html" : 'table/iscTableRow.html';

        var rowTemplate = _.get(scope, 'iscTblCtrl.tableConfig.rowTemplate', defaultTemplate);
        if( rowTemplate ){
          //for some reason the template doesn't like spaces nor comments
          var template = removeTemplateSpaces( $templateCache.get( rowTemplate ) );
          trElem.html( template );
          $compile( trElem.contents() )( scope );
        }
      }

      function post( scope, elem, attr , iscRowCtrl){
        iscRowCtrl.iscTblCtrl = scope.iscTblCtrl;
        scope.$watch( 'dataItem', function( value ){
          iscRowCtrl.dataItem = value;
        } );
      }

      function removeTemplateSpaces(templateStr) {
        return templateStr
            .replace(/\r?\n|\r/g, ' ')  //replace newline with space
          //jshint ignore:start
            .replace(/\>[ \t]+\</g, '\>\<')// remove space between elements/tags
          //jshint ignore:end
            .replace(/\s{2,}/g, ' '); //replace 2+ spaces with 1 space
      }

    }
  }

  // ----------------------------
  // inject
  // ----------------------------

  angular.module( 'isc.table' )
      .directive( 'iscTableRow', iscTableRow );

})();
