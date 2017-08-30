# uifw

---
### HealthShare UI Framework is intended to be used across multiple projects

*NOTE*: uifw is not a standalone project -- it only contains common framework code. To become a standalone project, it needs to be complemented with application specific code. see: [Getting started](#getting-started))

## First-Time Git Setup
```
$ git config --global user.name "John Doe"
$ git config --global user.email johndoe@intersystems.com
```
---
## Prerequisites:
1. Make sure you've read both [uifw-tools](https://github.com/intersystems/uifw-tools/blob/master/README.md) and [uifw](https://github.com/intersystems/uifw/blob/master/README.md) README.md files
2. Make sure you've installed [uifw-tools] and its [prerequisites](https://github.com/intersystems/uifw-tools/blob/master/README.md#requirements)

**Note**: If you are creating a modified build of your application, **you should not modify these files.** If you do, you risk them being overwritten on routine updates.

---

## Style Guide
The [UIFW Style Guide](https://learning.intersystems.com/pluginfile.php/1654/mod_resource/content/5/www/index.html#/overview "UIFW Style Guide") contains demos and code snippets for all uifw components, documentation for framework theming and design patterns, and helpful design guidance and resources (**Note:** You must be logged in & VPN connected to access this content.)


## Training Videos
Online training videos are internally network-shared here: [//iscinternal.com/isc/public/LearningServices/HealthShare/Henry Zou]

---

## Getting Started
**WARNING**: The following instructions will fail if these [prerequisites](#prerequisites) were not satisfied.

### For framework developers
```bash
    #clone repo && switch to folder
    git clone https://github.com/intersystems/uifw.git
    cd uifw

    #install npm dependencies
    slush isc:install
```    
### For app developers (new project)
```bash
    # create a new project and push it to the destination GitHub Repo
    slush isc:createRepo
```
### For app developers (clone project)
```bash
    #clone existin GitHub project
    slush isc:cloneRepo
```

---
## Run application
*note:* app specific commands requires app code

```bash
slush isc:install #installs npm packages
gulp serve       #only app specific
```

Run tests:

```bash
gulp test        #only app specific. It runs test:common, test:components, and test:app
gulp test:common
gulp test:components
gulp test:app    #only app specific
```

Update framework: //make sure your workarea is clean

```bash
slush isc:updateUifw
#create PR on GitHub
```

Override app.config.js (for specifying dev/deploy configurations):
```bash
# for specifying runtime application config
gulp serve --config <any valid directory>/<anyFileName>.js #only app specific
gulp build --config <any valid directory>/<anyFileName>.js #only app specific
gulp deploy --config <any valid directory>/<anyFileName>.js #only app specific
```

Override gulp/config.app.js:
```bash
# for specifying compile time application config -- to specify editions or different platform targets (mobile, web)
gulp serve --appjson path/to/config.app.js #only app specific
gulp build --appjson path/to/config.app.js #only app specific
gulp deploy --appjson path/to/config.app.js #only app specific
```
---
### File structure
```
    |-- gulpfile.js //utilizes gulp tasks inside of ./gulp/ folder
    |-- gulp
    |   |__ config.app.js   // this file imports settings from config.common and config.components
    |   |__ config.common.js
    |   |__ config.framework.js
    |-- config.xml  //used by cordova
    |-- jsdocs
    |   |__ conf.json   //jsDocs configuration
    |-- src //source code
    |   |-- index.html
    |   |-- common  //should not contain any UI Components / CSS styles
    |   |   |-- assets
    |   |   |-- modules
    |   |   |   |__ isc.common.module.js
    |   |   |__ package.json    
    |   |-- components
    |   |   |-- foundation
    |   |   |   |__ base //default edition
    |   |   |   |   |-- assets
    |   |   |   |   |-- modules
    |   |   |   |   |   |__ isc.components.module.js
    |   |   |   |   |-- package.json
    |   |   |   |   |__ config.components.js
    |   |-- app     //application specific
    |   |   |-- assets
    |   |   |-- modules
    |   |   |-- package.json  
    |-- test
    |   |-- unit
    |   |   |-- common
    |   |   |-- components
    |___|___|__ app     //application specific
```

---
###gulp configs
**This framework is designed to virtually eliminate the need to write custom automation tasks. The out-of-the-box automation tasks utilize these three configuration files: gulp/config.common.js, gulp/components.json, and gulp/config.app.js.**

**Notes:**
  * This *config structure* applies to ```gulp/config.app.js```, ```src/components/<edition path>/components.json```, and ```gulp/config.common.js```
  * The paths must be relative to the root of the application
  * Be sure to never reference files from another module or outside of their perspective section: *src/common*, *src/components*, and *src/app*.
  * The automation scripts will load the config sections in this orders:
    1. gulp/config.common.js
    2. src/components/<edition path>/config.components.js
    3. gulp/config.app.js

```javascript
{
  "vendor" : {
    "js" : [
      // This is where we specify npm files
      // Exceptions: If files need to be loaded after all 3 "vendor/js", be sure to place it in the "module/assets/vendor/js" section
      // e.g., "src/common/node_modules/jquery/dist/jquery.js"
    ],
    "mocks" : [
      // This is where we specify vendor mock files
      // e.g., "src/common/node_modules/angular-mocks/angular-mocks.js"
    ],
    "fonts" : [
      // This is where we specify vendor font files
      // e.g., "src/components/foundation/base/node_modules/font-awesome/fonts/fontawesome-webfont.*"
    ]
  },
  "customer"     : { // app specific. Used by customer to override application code
    "assets": {
      "i18n": [
        // default will replace the entire file, to change this add "_UifwMergeAlgorithm": "merge" to the json file
        // e.g., "customer/assets/i18n/**/*.json"
      ],
      "FDN" : [
        // default will replace the entire file, to change this add "_UifwMergeAlgorithm": "merge" to the json file
        // e.g., "customer/assets/FDN/**/*.json"
      ]
    }
  },
  "module" : {
    "modules": [
      // This is where we specify our own module files
      // Since the order of JS files matter, Angular modules must be loaded before they are referenced, this allows module definitions to be loaded before they are used      
      // e.g., "src/components/foundation/base/modules/**/*.module.js"
    ],
    "js" : [
      // This is where we specify our own js files
      // They will be loaded after after the "module/modules" files
      // e.g., "src/components/foundation/base/modules/**/*.js"
    ],
    "html" : [
      // This is where we specify html files
      // e.g., "src/components/foundation/base/modules/**/*.html",
      // e.g., "src/components/foundation/base/assets/**/*.html"
    ],
    "assets" : {
      "FDN" : [  
         // This is where we specify FDN files
         // e.g., "src/app/assets/FDN/**/*.json"
      ],
      "i18n" : [
        // This is where we specify i18n files                   
        // e.g., "src/app/assets/i18n/**/*.json"
      ],
      "images" : [
        // This is where we specify image files.
        // They'll compressed and moved into "www/images/"
        // e.g., "src/components/foundation/base/assets/images/**/*",
        // e.g., "src/components/foundation/base/assets/vendors/leaflet/images/**/*"
      ],
      "vendor" : {
        "js" : [
          // This is where we specify vendor files we've added to our source code
          // These files will be loaded after "vendor/js"
          // Exception: If files need to be loaded before all 3 "module/assets/vendor/js", be sure to place it in the "vendor/js" section
          // e.g., "src/components/foundation/base/assets/vendors/n3-charts/build/LineChart.js",
          // e.g., "src/components/foundation/base/assets/vendors/leaflet/leaflet.js"
        ]
      }
    },
    "mocks" : [
      // This is where we specify our own mock files
      // e.g., "test/unit/components/componentUnitTestMocks.js"
    ],
    "tests" : [
      // This is where we specify the test files
      // e.g., "test/unit/components/**/*.test.js"
    ]
  },
  "edition"       : [
    {
      "name" : "base",
      "path" : "src/components/foundation/base/config.components.js"
    },
    // to specify another edition, add it to this edition array. For example the UK edition below.
    // the framework will take the array of edition configurations and merge them to produce a single master components configuration
    {
      "name" : "UK",
      "path" : "src/components/foundation/UK/config.components.js"
    }
  ],
  "dest" : { // application specific
     "folder"       : "www",
     "comments"     : "i18nXml is used for specifying destination location of converted i18n files",
     "fdn"          : "www/assets/FDN/",
     "i18n"         : "www/assets/i18n/",
     "i18nXml"      : "isc-tools/localize",
     "i18nExtract"  : "isc-tools/i18nExtract"
  },
  "comments"      : "JavaScript files can't be overridden like css selector cascading or Angular's templateCache templates.",
  "comments"      : "If we want to override lower level JS files, we must exclude them from the list.",
  "comments"      : "The overrides below are used to exclude base files by specifying glob patterns.",
  "comments"      : "e.g. ```common: ['!src/modules/isc.filters/myFilter.js']```",
  "overrides"     : {
    "js" : {
      "common"     : [],
      "components" : []
    },
  "comments"      : "Used to exclude files in common/component. e.g. ```common: ['!src/modules/isc.filters/myFilter.html']```",
    "html" : {
      "common"     : [],
      "components" : []
    }
  }
}
```

---
### FAQs
* **I am getting this error message ```slush: command not found```**
  * Make sure your environment satisfies all of the [prerequisites](#prerequisites) and [uifw-tools] is installed

* **This framework looks awesome, how do I create a fully functional application using this framework in a couple of minutes?**
  * We highly recommend leveraging our [uifw-tools] to facilitate the creation of your new application.

* **What are the differences between "src/app", "src/common" and "src/components"**
  * "src/common" is framework code and should only be updated directly by framework developers. It defines system wide behaviors such as session management, state authorization, page configuration, and etc.
  * "src/components" is a framework code and should only be updated directly by framework and edition developers. It defines different UI-Components (bootstrap, foundation for apps, angular material) and the different editions (US, UK, Chinese) utilizing for the selected UI-Component.
  * "src/app" is application code should only be updated by application developers.  It contains application specific logic and pages.

* **I want to include a new npm package to my application, where should I install it?**
  * Application specific npm packages should be installed under "src/app/" folder (don't install it in "src/common" and "src/components")

* **Now that I have npm package successfully installed in "src/app/" folder, how do I add it to the application?**
  * We use Gulp to automate our build tasks. Application specific gulp configuration can be found at "gulp/config.app.js". You'll need to specify the file path of your npm package in "vendor/js" json property which is line 3 of "gulp/config.app.js" file.

* **How do I add a new javascript package which is not available through npm?**
  * You'll need to paste your non-npm library js files in "src/app/assets/vendors/" folder. If this folder doesn't exist, create one.
  * You'll have to reference your js file in "gulp/config.app.js" configuration file under this key path: "module/assets/vendor/js" array.

* **How do I include a 3rd party css file in my application?**
  * The framework does not support *.css file extensions, you'll need to rename your *.css extension to *.scss (superset of css) and place your *.scss file in "src/app/assets/sass/" folder. Once your file is in the sass folder, add a reference to  "src/app/assets/sass/main.scss" file.

* **How do I include a module specific scss file?**
  * This is a built-in functionality. Any scss file added to your module, matching this glob pattern ```src/app/modules/**/*.scss```, will automatically be compiled, concatenated, and shipped as part of your ```app.min.css```.

* **How do I control what gets outputted in the console?**
  * Open up your "src/app/modules/app.config.js" file and add/remove channels in 'devlogWhitelist' and 'devlogBlacklist' arrays. Note: "\*" means all channels.

* **How do I change the REST API's hostname and Port number?**
  1. You can change the hostname and PORT number inside of app config file located "src/app/modules/app.config.js"
  2. You can use an alternate config file with ```gulp serve --config <any valid directory>/<anyFileName>.js```

* **How do I promote an application feature to the framework?** (Be sure your changes are in common/components folder)
  * **Scenario 1**: The code I want to promote to framework are all in their own commits
    * Create a new branch off uifw master ```git checkout -b <branch> uifw/master```
    * Cherry-pick the feature commits. For each of your commits in reverse chronological order (oldest first)
        * ```git cherry-pick <commit-hash>```
            * if you have conflicts, resolve them first then continue ```git cherry-pick --continue```  
        * Once you have all the source code, commit the changes (if needed).
    * Push the changes to uifw (not origin)  ```git push uifw <branch> ```
    * Create a Pull Request
  * **Scenario 2**: The code I want to promote to framework are committed but contains non-feature code
    * Create a new branch off uifw master ```git checkout -b <branch> uifw/master```
    * Cherry-pick the feature commits. For each of your commits in reverse chronological order (oldest first)
        * ```git cherry-pick --no-ff --no-commit <commit-hash>```
            * if you have conflicts, resolve them first then continue ```git cherry-pick --continue```  
        * Remove all changes that's not part of your feature
        * Once you have all the source code, commit the changes
    * Push the changes to uifw (not origin)  ```git push uifw <branch>``
    * Create a Pull Request`
  * **Scenario 3**: The code I want to promote to framework have not been committed
    * Stash your changes ```git stash save "<message>"```
    * Create a new branch off uifw master ```git checkout -b <branch> uifw/master```
    * Apply your stashed changes ```git stash apply```
    * Resolve conflicts (if any)
    * Once you have all the source code, commit the changes
    * Push the changes to uifw (not origin)  ```git push uifw <branch> ```
    * Create a Pull Request
  * **Scenario 4**: The code I want to promote to framework are committed, and I can't easily isolate the commits. But the good news is, the code is all in my <localBranch>
    * Create a new branch off uifw master ```git checkout -b <branch> uifw/master```
    * Merge your <localBranch> into your <branch> without fast-forward and commit, which allows you to pick the changes you want ```git merge --no-ff --no-commit <localBranch>```
    * Remove the files/changes you don't want to promote to the framework
    * Once you have all the source code, commit the changes
    * Push the changes to uifw (not origin)  ```git push uifw <branch> ```
    * Create a Pull Request

* **I have an existing application and my framework is out of date. How can I upgrade my application's framework (cool slush way)?**
  1. Update your ```uifw-tools``` by executing ```slush isc:update```
  1. execute ```slush isc:updateUifw```
  1. create a PR to merge this to your project's master branch

* **I have an existing application and my framework is out of date. How can I upgrade my application's framework (the old fashion way)?**
  1. Ensure you have a local git remote ```uifw``` is pointing to "https://github.com/intersystems/uifw.git"
    1. execute ```git remote -v``` to check existing git remote repo mappings
    1. if "uifw" doesn't exist, add it by executing ```git remote add uifw https://github.com/intersystems/uifw.git```
  1. Ensure you have a local git remote ```uifw-app``` is pointing to "https://github.com/intersystems/uifw-app-scaffold.git"
    1. execute ```git remote -v``` to check existing git remote repo mappings
    1. if "uifw-app" doesn't exist, add it by executing ```git remote add uifw-app https://github.com/intersystems/uifw-app-scaffold.git```
  2. create a new branch off remote master ```git checkout -b framework-update-<date> origin/master```
  3. pull the framework into your branch ```git pull uifw master```
  4. resolve conflicts (if any) and commit
  5. update your npm packages (we recommend using [uifw-tools] ```slush isc:install```)
  6. Smoke test your application ```gulp serve```
  7. commit your changes (if any)
  8. push to origin ```git push origin framework-update-<date>```
  9. create a PR to merge this to your project's master branch

* **How do I specify who is authorized to access my page (ui-router state)?**
  * Navigate to where you've defined the ui-router state for your landing page and update ```roles``` property.  For reference, see  **src/app/modules/login/login.module.js**

* **How do I specify a landing page for specific user role?**
  * Navigate to where you've defined the ui-router state for your landing page and add/update  ```landingPageFor``` property and include your user role as one of the array values. For reference, see  **src/app/modules/login/login.module.js**

* **How come when I successfully authenticated a user(Status Code 200 from REST API), nothing happens, I am still at the login page?**
  * That's because you haven't specified a landing page for the authenticated user role. You need to specifiy a landing page for your authenticated user's role. For reference, see  **src/app/modules/login/login.module.js**

* **I created a Pull-Request, but it won't let me merge it due to conflicts. How do I resolve this?**
  * merge the latest of origin master to your local branch  ```git pull origin master```
  * resolve conflicts
  * stage your changes ```git add <filename>```
  * commit your resolved changes  ```git commit -m '<your message>'```
  * Assume your branch is called "my-feature-branch". Push your changes to your tracked server branch  ```git push origin <my-feature-branch> ```

* **How do I specify a different edition (US/UK)?**
  * *note:* By default the code uses "base" edition, which is the US edition. Specific Edition config file will be merged with base edition. (using _.mergeWith() where it concatenates arrays)
  * Add a new edition config object in the "edition" array of ```gulp/config.app.js``` configuration

* **How do I add functionality to the faux-table directive?**
  * You can change the template by passing in an attribuite ```templateUrl```. When specifying the html attribute, be sure to use kebab-case as in ```template-url```.
  * You can pass in additional configuration properties by creating a config object and passing it in on the ```config``` attribute.
  * Example html:
  ```
  <faux-table template-url="path/to/the/file.html"
              config="ctrl.myConfigObj"></faux-table>
   ```

```javascript
  "edition"       : [
     {
       "name" : "base",
       "path" : "src/components/foundation/base/config.components.js"
     },
     {
       "name" : "US",
       "path" : "src/components/foundation/US/edition.json"
     }
   ]
```   

* **How do I add/exclude specific js in common or components?**
  * add glob patterns to ```gulp/config.app.js -> overrides/js/[common/component]``` configuration

* **How do I exclude specific html in common or components?**
  * add glob patterns to ```gulp/config.app.js -> overrides/html/[common/component]``` configuration

* **How do I exclude specific scss in common or components? (coming soon)**
  * add glob patterns to ```gulp/config.app.js -> overrides/scss/[common/component]``` configuration

* **How do I create custom gulp tasks**
  * Custom gulp tasks should be created using the established format (exporting init()) and they should be saved in ```gulp/custom/``` directory

* **How do I override built-in gulp tasks**
  * There are two ways to override built-in gulp tasks
    * **Method 1** Create new gulp tasks with the same **file names** matching the ones you wish to override and place them in ```gulp/custom/``` directory
    * **Method 2** Create new gulp tasks with the same **task names** matching the ones you wish to override and place them in ```gulp/custom/``` directory

* **My backend APIs are on a different origin/domain, what's the best practice to connect to them?**
  * Our ```gulp serve``` task reverse-proxy support integrated into BrowserSync. Your application should leverage this to communicate to any backend APIs
    * 1. Make sure your application is using relative path to access those APIs. This requires your application to remove hostname, port, and protocol from your ```src/app/modules/app.config.js``` file
    * 1. Add your proxy patterns to ```gulp/proxy.js``` file. See examples below:
    * see: https://github.com/chimurai/http-proxy-middleware
    ```javascript
    module.exports = [
      { // When requests are going to “http://localhost:3000/api/v1/** they will be redirected to "http://localhost:3030/api/v1/**"
        pattern : "/api/v1/admin/user",
        pathRewrite: {
          "/api/v1/admin/user": "/api/v1/admin" //removing "user" from url
        },
        target  : "http://localhost:3030",
        logLevel: 'debug'
      }, { // When requests are going to “http://localhost:3000/api/** they will be redirected to "http://devrefhspd:7162/healthshare/api/v1/**"
        pattern : "/api",
        target  : "http://devrefhspd:7162/healthshare",
        logLevel: 'debug'
      }
    ];
    ```
    * NOTE - in the proxy.js file, be sure to put a leading slash, e.g.
    ```"/public/api/v1"```
    but in the app.config.js file, omit the leading slash, e.g.
     ```"public/api/v1"```

#### * **How do I flag string literals to be translated?**
  * The translation keys are extracted via the ```gulp i18nExtract``` task. It will extract keys matching these following patterns:
  ```
  // HTML
  {{ "my literal" | translate }}
  {{ ::"my literal" | translate }}

  <translate>my literal</translate>
  <any translate="my literal"><any>
  <any ng-html-bind="'my literal' | translate"><any>
  <any config-item-translation-key="my literal"><any>

  {{ "my {{literal}}" | translate: objWithLiteralKey }}

  {{ foo ? "my literal" : baz | translate }}
  {{ foo ? bar : "my literal" | translate }}
  {{ foo ? "my literal" : "my literal2" | translate }}

  {{ $ctrl.condition || "my literal" | translate }}
  {{ "my literal" || $ctrl.condition | translate }}


  //JavaScript
  var translateComment = /* i18nextract */"my literal"; //use this for any keys in config blocks
  var state = {
    translationKey: "my literal"
  }
  $translate.instant('my literal');
  $translate('my literal');
  $filter('translate')('my literal');
  $translate(['my literal1', 'my literal2']);

  ```

* **Where are the extracted i18n output files from the previous question?**
  * By default, they are located in ```isc-tools/i18nExtract``` folder. This can be changed by updating ```gulp/config.app.js``` file's ```dest/i18nExtract``` key

* **Where do I put the i18n files for my application to use?**
  * copy ```en-us.json```  to ```src/app/assets/i18n/en-us.json```

* **The i18n extract folder has two files. What are the differences?**
  * ```en-us.json``` is the extract file where the key and the values are the same (in English)
  * ```en-us-greek-text.json``` have all the keys in ```en-us.json``` file but the values have been altered to append "英" and prepend "文".
  These files can be used by developers to easily identify which string literals in their application are not translated.
  Visually verify the app, the fields missing "英" and "文" are the untranslated literals.. Make sure these files are copied:
      * copy ```en-us-greek-text.json``` to ```src/app/assets/i18n/en-us.json```

* **How do I contribute to i18n extraction patterns?**
  * You'll need to create RegExp for matching and capturing the translation literals and ask a UIFW developer to add it to UIFW for you.

* **How do I override 404 status-code traffic so I can stay on my page instead of get redirected to login?
  * In order to control 404 status-code inside your application, the framework exposes interface to allow the application inject an array of REGEX that will capture the url to ignore by the interceptor.
    To add items to the application follow these steps:
    1. Open the "app.module.js" file and go to the "run()" function.
    2. To config the interceptor, we provide an object, please add a new property "ignoredUrls" to the object.
    3. By default, "ignoredUrl" has 2 items (/api\/v1\/auth\/status$/, /api\/v1\/auth\/logout$/), make sure that in your new
       object, you add these items first, and then add your custom regext to the array.

       ```javascript
       function run( ...... ){
         ....
         ....
         iscAuthenticationInterceptorConfig.configure( {
               statusApiUrl: apiHelper.getUrl( 'auth/status' ),
               ignoredUrls: [
                 /api\/v1\/auth\/status$/,
                 /api\/v1\/auth\/logout$/,
                 /api\/v1\/mobile\/accessCode/,
                 /cordova\.js$/
               ]
             } );

         ....
         ....
       }
       ```  
* **How do I dynamically set the page title based on ui-router state config?**
  * simply add a ```data.title``` property to your state config

       ```javascript
         function getStates() {
           return {
             'authenticated.dashboard': {
               url           : 'dashboard',
               state         : 'authenticated.dashboard',
               ...
               //unless explicitly overriden, ui-router's data object will be inherited by descendant states
               data          : {
                  title : "Patient Dashboard"
               }
             }
           };
         }
       ```  

* **How do I format my JavaScript code to meet the coding guideline?**
  * execute ```gulp jsformat``` in the git project folder

* **I am running “Deploy” operation and my client fails with a message such as “eProvider” not found
  *This issue is typical to a client script that was “minified” and “uglified”. During the deploy process when we minify and uglify the scripts,
   all the function’s arguments names are changed to a single letter.
   If you had an injection of “$scope” for example, after minification, it will change to a single letter like “e”.

   To address the issue you must instruct the tools which preparing the scripts to inject the correct “Angular” services and injectables into the
   functions of the "resolve" section of a "state" definition.
   To do so you need to add the following comment in various locations:
   ```javascript
     /* @ngInject */
   ```

   State definition with “resolve”:
   ===============================
   When you define “states” for the ui-route module, you have the option to define “resolves” functions.
   These function also allow to inject “angular” injectable.
   You will have to place
   ```javascript
   /* @ngInject */
    ```
   before each function of the “resolve” section.
   ```javascript
    resolve :  /* @ngInject */ {
         loadVersion: function( cmcVersionApi ) {
           return cmcVersionApi.load();
         },

         loadObjectUidModel: function( loadVersion, cmcObjectUidApi ) {
           return cmcObjectUidApi.loadModel();
         }
     }
   ```

---
###Git 101
```bash
# To switch between existing local branches
git checkout <branch>

# checkout last branch (good fo toggling between two branches)
git checkout -

# revert file/folder to specific remote server commit version
git checkout <remote>/<branch> <path-to-file-or-folder> 
#example: git checkout uifw/master gulp/proxy.js 

# revert file/folder to specific local commit version
git checkout <branch> <path-to-file-or-folder> 
#example: git checkout master gulp/proxy.js 

# revert file/folder to original commit version
git checkout -- <path-to-file-or-folder> 
#example: git checkout -- gulp/proxy.js

# Check which branch you are currently on (current branch)
git branch

# Check existing local branches
git branch

# Create a new branch based off your current branch and switch to your new branch
git branch -b <branch>

# Create a new branch based off a origin *branch* and switch to your new branch
git checkout -b <branch> origin/<branch>

# delete a local branch
git branch -d <branch>

# Check existing remote repos
git remote -v

# Add uifw repo
git remote add uifw <core repo uri>

# Check status of git (what's staged and unstaged)
git status

# Stage files by file path
git add <file path>

# Stage all changes
git add -A

# Stage updated changes
git add -u

# Commit the staged changes with message
git commit -m '<message>'

# Commit the staged and unstaged changes with message
git commit -am '<message>'

# Push commits to origin branch
git push origin <branch>

# Fetch all server branches
git fetch

# Update your branch to the latest
git pull origin <branch>

# Cherry-pick a commit from another branch into your current branch
git cherry-pick <commit hash>

# log commits on oneline
git log --oneline

# remote locally branches which no longer exists on server
git remote update --prune

# create git aliases for logging last commit (usage: git last)
git config --global alias.last 'log -1 --oneline HEAD'
```

---
###Mac Terminal shortcuts (OS X only)
```bash

# delete the word immediately before, or to the left of, the cursor
Control + w

# allow you to find a previously used commands that you may need to access again
Control + r

# take you to the end, or the far right, of the line where your cursor is
Control + a

# take you back to the beginning, or the far left, of the line where your cursor is
Control + e

# clears the entirety of the line before the cursor
Control + u

# his will clear the line that appears after the cursor
Control + k

# clear the entire Terminal screen you're working on, deleting everything
Command + k

# the cursor forward by one word
Escape + f

# the cursor back by one word
Escape + b

```

###Bash 101 (OS X only)
```bash
# go to home (same as cd ~)
cd

# go to last directory (good fo toggling between two directories)
cd -

# last command's arguments
!*

# last command's last arguments
!^

# last command's first command
!$

# last command
!!

# search last commands
CTRL+R

# last command start with cat
!cat

# last command containing cat
!?cat

# replace cat with meow in last command
^cat^meow

# list directory with human readable size in long format
ls -lh

# mkdir create parent directories as needed
mkdir -p parent/child/myfolder

# create new file if doesn't exist or update access time if already exists
touch <file name>

#copy entire directory and its content
cp -a src/ dest/

# delete a folder and its content
rm -rf <folder>

# find files in /home directory which matches '.bash*' pattern
find /home -name '.bash*'

# first few lines
head <file>

# last few lines
tail <file>

# last few lines and watch for updates
tail -f <file>

# output the content of a file
less <filename>


```
[uifw-tools]: https://github.com/intersystems/uifw-tools
[changelog.md]: https://github.com/intersystems/uifw/blob/master/changelog.md
