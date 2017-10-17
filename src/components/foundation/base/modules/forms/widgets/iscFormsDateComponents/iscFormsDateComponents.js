/**
 * Created by paul robbins on 7/21/15
 *
 */

( function() {
  'use strict';

  angular.module( 'isc.core' )
    .directive( 'iscFormsDateComponents', iscFormsDateComponents );

  /**
   * @ngdoc directive
   * @memberOf isc.core
   * @param keyCode
   * @param $window
   * @param $document
   * @param devlog
   * @param iscCustomConfigService
   * @returns {{restrict: string, replace: boolean, require: string, scope: boolean, link: link, bindToController: {modelAsObject: string, allowPartialDates: string}, controllerAs: string, controller: controller, templateUrl: directive.templateUrl}}
   * @example
   * SAMPLE HTML USAGE
   *   <isc-form-date-components
   *      ng-model='ctrl.model.data.dob' >
   *   </isc-form-date-components>
   */
  /* @ngInject */
  function iscFormsDateComponents( keyCode, $window, $document,
    devlog, iscCustomConfigService ) {//jshint ignore:line

    // ----------------------------
    // vars
    // ----------------------------

    // ----------------------------
    // class factory
    // ----------------------------
    var directive = {
      restrict        : 'E',
      replace         : true,
      require         : 'ngModel',
      scope           : true,
      link            : link,
      bindToController: {
        modelAsObject    : '=',
        allowPartialDates: '='
      },
      controllerAs    : 'dateComponentsCtrl',
      controller      : controller,
      templateUrl     : function( elem, attrs ) {
        return attrs.templateUrl || 'forms/widgets/iscFormsDateComponents/iscFormsDateComponents.html';
      }
    };

    return directive;

    // ----------------------------
    // functions
    // ----------------------------
    function controller() {
    }

    /**
     * @memberOf iscFormsDateComponents
     * @param scope
     * @param elem
     * @param attrs
     * @param ngModel
     */
    function link( scope, elem, attrs, ngModel ) {
      var modelAsObject     = scope.dateComponentsCtrl.modelAsObject,
          // Partial dates only make sense if stored as an object
          allowPartialDates = scope.dateComponentsCtrl.allowPartialDates && modelAsObject;

      // Disable each component input if the control's disabled attribute is set
      scope.$watch(
        function() {
          return attrs.disabled;
        },
        function( value ) {
          scope.disabled = value;

          // If disabling, clear inputs
          if ( scope.disabled ) {
            scope.date.day   = '';
            scope.date.month = '';
            scope.date.year  = '';
          }
        }
      );

      // Config and consts
      var config               = iscCustomConfigService.getConfig();
      scope._dateStorageFormat = scope.dateStorageFormat || config.formats.date.database;
      scope._dateDisplayFormat = scope.dateDisplayFormat || config.formats.date.shortDate;

      scope.maxYear = moment().year() + 50;
      scope.minYear = moment().year() - 250;

      var keys      = keyCode;
      scope.navKeys = [
        keys.BACKSPACE,
        keys.DELETE,
        keys.TAB,
        keys.SHIFT,
        keys.HOME,
        keys.END,
        keys.LEFT,
        keys.UP,
        keys.RIGHT,
        keys.DOWN
      ];

      scope.numericKeys = [// 0 through 9
        48, 49, 50, 51, 52, 53, 54, 55, 56, 57
      ];

      scope.date = {
        day  : '',
        month: '',
        year : ''
      };

      // Initialize scope.date for component controls
      ngModel.$render = function() {
        var model = ngModel.$viewValue;
        if ( model ) {
          if ( modelAsObject ) {
            angular.extend( scope.date, model );
          }
          else {
            var mDate = moment( model );
            if ( mDate.isValid() ) {
              scope.date.day   = mDate.get( 'date' );
              scope.date.month = mDate.get( 'month' ) + 1; // moment.get('month') is zero-based
              scope.date.year  = mDate.get( 'year' );
            }
          }
        }

        // Set up watch to update ngModel from scope components
        scope.$watch( 'date', updateModel, true );

      };

      // Updates ngModel (string) from scoped components (object)
      function updateModel( newVal, oldVal ) {
        // Debounce to limit multiple updates due to separate data fields and numeric up/downs
        _.debounce( update, 100 )();

        function update() {
          if ( newVal !== oldVal ) {
            var date = scope.date;

            if ( allowPartialDates && (date.day || date.month || date.year) ) {
              setNgModel( date );
              return;
            }
            else {
              if ( date.day && date.month && date.year ) {
                setNgModel( date );
                return;
              }
            }

            // If invalid, clear model value
            clearNgModel();
          }
        }

        function setNgModel( date ) {
          if ( modelAsObject ) {
            var objDate = {};
            _.extend( objDate, date );
            ngModel.$setTouched();
            ngModel.$setViewValue( objDate );
          }
          else {
            var mDate = moment(
              date.month + '-' + date.day + '-' + date.year,
              ( date.year.length < 4 ? 'M-D-YY' : 'M-D-YYYY' )
            );
            if ( mDate.isValid() ) {
              ngModel.$setTouched();
              ngModel.$setViewValue( mDate.format( scope._dateStorageFormat ) );
            }
            else {
              clearNgModel();
            }
          }
        }

        function clearNgModel() {
          if ( modelAsObject ) {
            ngModel.$setViewValue( {} );
          }
          else {
            ngModel.$setViewValue( '' );
          }
        }
      }

      // Internal validation
      // Use onKeyPress to ensure numerics are enforced and avoid input flickering
      scope.checkInput = function( component, maxLength, event ) {
        var $e  = $( event.target ),
            key = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;

        // Chrome does not need this check, but Firefox does
        if ( _.includes( scope.navKeys, key ) ) {
          return true;
        }
        // If non-numeric, cancel out. Chrome prevents non-numeric on type=number,
        // but other browsers (such as Firefox) do not.
        else if ( !_.includes( scope.numericKeys, key ) ) {
          return rollback();
        }
        else {
          // Calculate the entered value by concatting the existing value to the number entered
          var currentValue   = $e.val(),
              attemptedValue = currentValue + ( key - 48 ).toString();

          var selectedText  = getSelectionText();
          var selectionSize = selectedText.length;

          // If the field being modified is already of the maximum length,
          // and the selection is empty, cancel.
          if ( attemptedValue.length > maxLength && !selectionSize ) {
            return rollback();
          }
          else {
            var num = parseInt( selectionSize ? currentValue : attemptedValue ),
                min = 0, // not using min attr here because it makes entering the year problematic
                max = parseInt( $e.attr( 'max' ) );
            // If somehow a non-numeric is entered, cancel.
            if ( isNaN( num ) ) {
              return rollback();
            }
            // If the field being modified is outside the allowed range, set it to the range boundary.
            else if ( !isNaN( min ) && num < min ) {
              return rollback( min );
            }
            else if ( !isNaN( max ) && num > max ) {
              return rollback( max );
            }
          }
        }

        // If here, the input is valid
        return true;

        function rollback( value ) {
          event.preventDefault();
          if ( value ) {
            scope.date[component] = value;
          }
          return false;
        }

        function getSelectionText() {
          // Selection handler for browsers still supporting selectionStart for type=number (Firefox)
          try {
            var selStart = event.target.selectionStart,
                selEnd   = event.target.selectionEnd;

            if ( selStart !== undefined ) {
              return event.target.value.substr( selStart, selEnd - selStart );
            }
            else {
              return baseSelection();
            }
          }
          // Base selection handler for browsers that do not (Chrome)
          catch ( x ) {
            return baseSelection();
          }

          function baseSelection() {
            if ( $window.getSelection ) {
              return $window.getSelection().toString();
            }
            else if ( $document.selection && $document.selection.type !== 'Control' ) {
              return $document.selection.createRange().text;
            }
          }
        }
      };

      // Sets the maximum value for the day component, based on the month component and leap year status
      scope.getMaxDay = function() {
        var date = scope.date;

        var monthsWith31Days = [1, 3, 5, 7, 8, 10, 12];
        var monthsWith30Days = [4, 6, 9, 11];

        var maxDay;
        if ( !date.month ) {
          maxDay = 31;
        }
        else if ( _( monthsWith31Days ).includes( +date.month ) ) {
          maxDay = 31;
        }
        else if ( _( monthsWith30Days ).includes( +date.month ) ) {
          maxDay = 30;
        }
        else if ( date.month === '2' ) {
          if ( moment( [date.year] ).isLeapYear() ) {
            maxDay = 29;
          }
          else {
            maxDay = 28;
          }
        }

        // Ensure day does not exceed max
        var currentDay = date.day;
        if ( currentDay && currentDay > maxDay ) {
          // Defer to allow models to update;
          // otherwise day may be undefined (invalid) if it exceeds the max
          // after a month update.
          _.defer( function() {
            date.day = Math.min( currentDay, maxDay );
          }, 0 );
        }

        return maxDay;
      };

      // Auto-tabbing day and month wire-up
      var $day   = elem.find( '.date-components-day' );
      var $month = elem.find( '.date-components-month' );
      var $year  = elem.find( '.date-components-year' );

      $month.on( 'input', function onChange() {
        if ( this.value.length === 2 ) {
          focusNext( $month );
        }
      } );

      $day.on( 'input', function onChange() {
        if ( this.value.length === 2 ) {
          focusNext( $day );
        }
      } );

      $year.on( 'blur', function onBlur() {
        if ( this.value.length === 4 ) {
          focusNext( $year );
        }
        ngModel.$setTouched();
      } );

      // Focuses on the next component input, if there is one
      function focusNext( input ) {
        var next = input.parentsUntil( '.date-container' ).next().find( 'input' );
        if ( next.length ) {
          next.focus();
        }
      }
    }

  }//END CLASS
} )();
