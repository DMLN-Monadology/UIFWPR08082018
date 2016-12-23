/**
 * Created by douglasgoodman on 11/25/14.
 */

var customConfig = getCustomConfig();

beforeEach( function() {
  customConfig = getCustomConfig();
} );

function getCustomConfig() {
  return {
    'production'     : false,
    'devlogWhitelist': [],
    'devlogBlacklist': [],
    'landingPages'   : {},
    'rolePermissions': {
      '*'    : ['index.login'],
      'user' : ['index.wellness.*', 'index.messages.*', 'index.library.*', 'index.calendar.*', 'index.myAccount.*'],
      'proxy': ['index.myAccount.*', 'index.messages', 'index.messages.inbox', 'index.messages.outbox', 'index.messages.refillPrescription']
    },
    'formats'        : {
      'date': {
        'shortDate'   : 'MM-DD-YYYY',
        'shortTime'   : 'h:mm A',
        'longDate'    : 'd MMMM yyyy',
        'longDateTime': 'd MMMM yyyy H:mm',
        'database'    : 'YYYY-MM-DD HH:mm:ss'
      }
    },
    'moduleApi'      : {
      'forms'         : {
        'path': 'forms'
      },
      'formData'      : {
        'path': 'formData'
      },
      'formTemplates' : {
        'path': 'formTemplates'
      },
      'formCodeTables': {
        'path': 'codeTables'
      }
    },
    'forms': {
      'defaultDisplayField'   : 'displayField',
      'debounce'              : 75,
      'allowInvalid'          : true,
      'updateOn'              : 'change',
      'updateOnExcluded'      : [
        'checkbox',
        'multiCheckbox',
        'radio',
        'select',
        'dateComponents',
        'dateComponentsPartial'
      ],
      'fieldLayout'           : {
        'breakpoints': [
          'small',
          'medium',
          'large',
          'xlarge'
        ],
        'classes'    : {
          'columns'   : '{{breakpoint}}-up-{{columns}}',
          'percentage': 'formly-field-{{breakpoint}}-{{percentage}}'
        }
      }
    },

    'userRoles': ['user', 'guest'],

    'topTabs': {
      '*': {
        'index.home': {
          'state'         : 'index.home',
          'translationKey': 'ISC_HOME_TAB',
          'displayOrder'  : 1,
          'exclude'       : false
        },

        'index.wellness': {
          'state'         : 'index.wellness',
          'translationKey': 'ISC_WELLNESS_TAB',
          'displayOrder'  : 2,
          'exclude'       : true
        },

        'index.messages': {
          'state'         : 'index.messages',
          'translationKey': 'ISC_MESSAGES_TAB',
          'displayOrder'  : 3,
          'exclude'       : true
        },

        'index.library': {
          'state'         : 'index.library',
          'translationKey': 'ISC_LIBRARY_TAB',
          'displayOrder'  : 4,
          'exclude'       : true
        },

        'index.calendar': {
          'state'         : 'index.calendar',
          'translationKey': 'ISC_CALENDAR_TAB',
          'displayOrder'  : 5,
          'exclude'       : true
        },

        'index.myAccount': {
          'state'         : 'index.myAccount',
          'translationKey': 'ISC_MY_ACCOUNT_TAB',
          'displayOrder'  : 6,
          'exclude'       : true
        },

        'index.customerTab': {
          'state'         : 'index.customerTab',
          'translationKey': 'ISC_CUSTOMER_TAB',
          'displayOrder'  : 7,
          'exclude'       : true
        }
      }
    },

    'loginButton': {
      'state'         : 'index.login',
      'translationKey': 'ISC_LOGIN_BTN',
      'displayOrder'  : 8,
      'exclude'       : false
    },

    'messages': {
      'secondaryNav': {

        'index.messages.inbox': {
          'state'         : 'index.messages.inbox',
          'translationKey': 'ISC_MESSAGES_INBOX_BTN',
          'displayOrder'  : 1,
          'exclude'       : true
        },

        'index.messages.outbox': {
          'state'         : 'index.messages.outbox',
          'translationKey': 'ISC_MESSAGES_OUTBOX_BTN',
          'displayOrder'  : 2,
          'exclude'       : true
        },

        'index.messages.archivedInbox': {
          'state'         : 'index.messages.archivedInbox',
          'translationKey': 'ISC_MESSAGES_ARCHIVED_INBOX_BTN',
          'displayOrder'  : 3,
          'exclude'       : true
        },

        'index.messages.archivedOutbox': {
          'state'         : 'index.messages.archivedOutbox',
          'translationKey': 'ISC_MESSAGES_ARCHIVED_OUTBOX_BTN',
          'displayOrder'  : 4,
          'exclude'       : true
        }
      },

      'tasks': {
        'index.messages.medicalQuestion': {
          'state'         : 'index.messages.medicalQuestion',
          'translationKey': 'ISC_MESSAGES_MEDICAL_QUESTION',
          'displayOrder'  : 1,
          'exclude'       : true
        },

        'index.messages.generalQuestion': {
          'state'         : 'index.messages.generalQuestion',
          'translationKey': 'ISC_MESSAGES_GENERAL_QUESTION',
          'displayOrder'  : 2,
          'exclude'       : true
        },

        'index.messages.requestAppointment': {
          'state'         : 'index.messages.requestAppointment',
          'translationKey': 'ISC_MESSAGES_REQUEST_APPOINTMENT',
          'displayOrder'  : 3,
          'exclude'       : true
        },

        'index.messages.refillPrescription': {
          'state'         : 'index.messages.refillPrescription',
          'translationKey': 'ISC_MESSAGES_REFILL_PRESCRIPTION',
          'displayOrder'  : 4,
          'exclude'       : true
        },

        'index.messages.requestReferral': {
          'state'         : 'index.messages.requestReferral',
          'translationKey': 'ISC_MESSAGES_REQUEST_REFERRAL',
          'displayOrder'  : 5,
          'exclude'       : true
        },

        'index.messages.requestTestResult': {
          'state'         : 'index.messages.requestTestResult',
          'translationKey': 'ISC_MESSAGES_REQUEST_TEST_RESULT',
          'displayOrder'  : 6,
          'exclude'       : true
        }
      }
    },

    'library': {
      'secondaryNav': {

        'index.library.healthDictionary': {
          'state'         : 'index.library.healthDictionary',
          'translationKey': 'ISC_LIBRARY_HEALTH_DICT_BTN',
          'iconClasses'   : 'fa fa-list-alt',
          'displayOrder'  : 1,
          'exclude'       : true
        },

        'index.library.news': {
          'state'         : 'index.library.news',
          'translationKey': 'ISC_LIBRARY_NEWS_BTN',
          'iconClasses'   : 'fa fa-list-alt',
          'displayOrder'  : 2,
          'exclude'       : true
        },

        'index.library.forms': {
          'state'         : 'index.library.forms',
          'translationKey': 'ISC_LIBRARY_FORMS_BTN',
          'iconClasses'   : 'fa fa-list-alt',
          'displayOrder'  : 2,
          'exclude'       : true
        }
      }
    },

    'calendar': {},

    'myAccount': {
      'secondaryNav': {

        'index.myAccount.summary': {
          'state'         : 'index.myAccount.summary',
          'translationKey': 'ISC_MY_ACCT_SUMMARY_BTN',
          'iconClasses'   : 'fa fa-list-alt',
          'displayOrder'  : 1,
          'exclude'       : true
        },

        'index.myAccount.history': {
          'state'         : 'index.myAccount.history',
          'translationKey': 'ISC_MY_ACCT_HISTORY_BTN',
          'iconClasses'   : 'fa fa-th',
          'displayOrder'  : 2,
          'exclude'       : true
        },

        'index.myAccount.password': {
          'state'         : 'index.myAccount.password',
          'translationKey': 'ISC_MY_ACCT_CHANGE_PASSWORD_BTN',
          'iconClasses'   : 'fa fa-asterisk',
          'displayOrder'  : 3,
          'exclude'       : true
        },

        'index.myAccount.email': {
          'state'         : 'index.myAccount.email',
          'translationKey': 'ISC_MY_ACCT_CHANGE_EMAIL_BTN',
          'iconClasses'   : 'fa fa-envelope',
          'displayOrder'  : 4,
          'exclude'       : true
        },

        'index.myAccount.proxies': {
          'state'         : 'index.myAccount.proxies',
          'translationKey': 'ISC_MY_ACCT_PROXIES_BTN',
          'iconClasses'   : 'fa fa-star-empty',
          'displayOrder'  : 5,
          'exclude'       : true
        }
      }
    },

    'customerTab': {
      'secondaryNav': {

        'index.customerTab.tab1': {
          'state'         : 'index.customerTab.tab1',
          'translationKey': 'ISC_CUSTOMER_TAB_1_BTN',
          'iconClasses'   : 'fa fa-list-alt',
          'displayOrder'  : 1,
          'exclude'       : true
        },

        'index.customerTab.tab2': {
          'state'         : 'index.customerTab.tab2',
          'translationKey': 'ISC_CUSTOMER_TAB_2_BTN',
          'iconClasses'   : 'fa fa--list-alt',
          'displayOrder'  : 2,
          'exclude'       : true
        }
      }
    }
  };
}
