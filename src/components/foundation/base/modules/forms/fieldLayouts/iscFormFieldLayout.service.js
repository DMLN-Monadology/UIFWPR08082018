/**
 * Created by probbins on 8/16/2016
 */

( function() {
  'use strict';

  /* @ngInject */
  angular.module( 'isc.forms' )
    .factory( 'iscFormFieldLayoutService', iscFormFieldLayoutService );

  function iscFormFieldLayoutService( $interpolate, iscCustomConfigService ) {
    var config;

    var service = {
      transformContainer: transformContainer
    };

    return service;

    /**
     * Transforms the given container of FDN FieldDefinitions by applying its layoutOptions to its fields.
     * This modifies the className property of the fieldContainer and possibly of its contained fields.
     * @param {Object} fieldContainer - The field definition in the FDN. This field is mutated by this function call.
     * @param {=bool} applyToDescendants - If truthy, the process is applied to all of the fieldContainer's descendants.
     */
    function transformContainer( fieldContainer, applyToDescendants ) {
      var config        = getConfig(),
          layoutOptions = _.get( fieldContainer, 'data.layout' ),
          childFields   = _.get( fieldContainer, 'fields' ) || _.get( fieldContainer, 'fieldGroup' );

      // If no layout options are specified, or this container has no fields, we are done
      if ( layoutOptions && childFields ) {
        var classes           = _.get( config, 'classes', {} ),
            breakpoints       = _.get( config, 'breakpoints', [] ),
            firstBreakpoint   = _.head( breakpoints ) || 'small',
            columnsSetting    = _.get( classes, 'columns', '' ),
            percentageSetting = _.get( classes, 'percentage', '' ),
            columns           = _.get( layoutOptions, 'columns' );

        // ---------------
        // Columns

        // Tag any container with a layout specified with a selector
        applyClassName( fieldContainer, 'has-data-layout' );

        applyClassName( fieldContainer, 'grid-block' );

        // If this column layout is a number, apply the layout by using the first -up breakpoint class.
        if ( !_.isNaN( parseInt( columns ) ) ) {
          applyClassName( fieldContainer, columnsSetting, {
            breakpoint: firstBreakpoint,
            columns   : columns
          } );
        }

        else if ( _.isObject( columns ) ) {
          // If the properties are column numbers, apply the minimum breakpoint to the fields as percentages.
          var columnsAreNumeric = _.every( columns, function( value, key ) {
            return !_.isNaN( parseInt( key ) );
          } );

          if ( columnsAreNumeric ) {
            applyToFields( columns, firstBreakpoint );
          }
          else {
            // If columns is not a number and not a list of columns, then it is a list
            // of breakpoint properties, so process each one individually.
            var columnObj = columns;

            _.forEach( breakpoints, function( breakpoint ) {
              columns = _.get( columnObj, breakpoint );

              if ( columns ) {
                // If the setting itself is an object, then sub-settings are column percentages.
                if ( _.isObject( columns ) ) {
                  applyToFields( columns, breakpoint );
                }
                else {
                  applyClassName( fieldContainer, columnsSetting, {
                    breakpoint: breakpoint,
                    columns   : columns
                  } );
                }
              }
            } );
          }
        }
      }

      // Recurse over children, if indicated
      if ( applyToDescendants ) {
        _.forEach( childFields, function( field ) {
          transformContainer( field, true );
        } );

        // Also apply transform to any inline-defined embedded forms
        // These are indicated by having a "data.embeddedFields" property
        _.forEach( _.filter( childFields, 'data.embeddedFields' ), function( efField ) {
          _.forEach( efField.data.embeddedFields, function( field ) {
            transformContainer( field, true );
          } );
        } );
      }

      function applyToFields( columns, breakpoint ) {
        // Get the max value for specified field indices so the fieldIndex can be determined.
        // E.g., if percentage widths for columns 1, 2, and 3 are specified, maxIndex = 3.
        var maxIndex = _.maxBy( _.keys( columns ), function( key ) {
          return parseInt( key );
        } );

        // Apply the percentage setting to each child field in this container
        _.forEach( childFields, function( field, index ) {
          var thisIndex  = ( index % maxIndex ) + 1,
              percentage = tryParsePercentage( columns[thisIndex] );

          if ( percentage ) {
            applyClassName( field, percentageSetting, {
              breakpoint: breakpoint,
              percentage: percentage
            } );
            applyClassName( field, 'grid-content' );
          }
        } );
      }
    }

    function tryParsePercentage( value ) {
      if ( _.endsWith( value, '%' ) ) {
        return value.replace( '%', '' );
      }
    }

    function applyClassName( fieldDefinition, classNameExpression, interpolatables ) {
      var className = $interpolate( classNameExpression )( interpolatables );

      if ( className && !_.includes( fieldDefinition.className, className ) ) {
        if ( fieldDefinition.className ) {
          fieldDefinition.className += ' ' + className;
        }
        else {
          fieldDefinition.className = className;
        }
      }
    }

    function getConfig() {
      // Lazy-load config property
      if ( !config ) {
        config = _.get( iscCustomConfigService.getConfig(), 'forms.fieldLayout' );
      }
      return config;
    }
  }
} )();
