/**
 * Created by Henry Zou on 10/27/15.
 *
 * To be used with iscGridFormItem
 */

(function (){
  'use strict';

  /* @ngInject */
  function ngTransclude($compile){
    return {
      priority: 1,
      compile : function (elem, attrs){
        //original is used as the default
        var originalTemplateEl;
        if (attrs.iscTransclude){
          originalTemplateEl = angular.element(elem).clone();
        }

        //elem contains ALL transcluded element within the parent directive with 'transclude: true'
        return function (scope, elem, attrs){
          if (attrs.iscTransclude){
            //removes non-maching transcluded elements
            elem.children().not(attrs.iscTransclude).remove();
            //if no transcluded content is specified, use the default (specified in the template)
            if (elem.children().length === 0){
              //must be added into the dom first before compiling, else it'll complain about element not part of transclusion directive
              elem.html(originalTemplateEl.html());
              $compile(elem.contents())(scope);
            }
          }
        };
      }
    };
  }//END CLASS


  // ----------------------------
  // injection
  // ----------------------------

  angular.module('isc.common')
    .directive('ngTransclude', ngTransclude);
})();
