:: Batch script to build a UIFW-derived UI as part of the InterSystems nightly/release build environment

:: Written by Dale du Preez, 9 February 2017

:: !! *WARNING* !!
:: Python *MUST* be installed for this script to work correctly.
:: Callers should specify the path to python in argument 6

:: Expected arguments:
:: 1. Root directory of UI source tree/repo
:: 2. Build project name, which is used to determine where output should be created and copied to
:: 3. Path to python
:: 4. Healthshare database name used to specify localization output location [optional]
:: 5. Gulp build command, normally 'build' or 'deploy'; defaults to 'deploy' if not specified [optional]

:: Dependency details - bump when needed; note that this script expects a specific directory naming convention
SET nodeversion=6.5.0
SET npmversion=3.10.3
SET portablegitversion=2.7.2

:: General flag to capture any error states - 0 means OK
SET RETURNCODE=0

:: Set debugging-driven flags
SET ROBOCOPYLOGGING=/NFL /NDL
IF "%MODE%"=="debug" (
	SET ROBOCOPYLOGGING=
)

SET origdir=%CD%
SET hsuidir=%1%
SET hsprojectname=%2
SET pythonpath=%3
SET hsdbname=%4
SET gulpbuildcommand=%5

IF "%gulpbuildcommand%"=="" (
	SET gulpbuildcommand=deploy
)

SET builddepdir=isc-tools\build-dependencies

SET oldpath=%PATH%
CD %hsuidir%
SET hsuidir=%CD%
SET popuishare=0
SET baseuidir=%hsuidir%\..
SET builtroot=%origdir%\..\..\built\%PLATFORM%\%MODE%
PUSHD %builtroot%
SET builtroot=%CD%
POPD
SET builtdir=%builtroot%\%hsprojectname%

SET copy_loc_strings=0
IF NOT "%hsdbname%"=="" (
	SET localizedir=%hsuidir%\..\..\databases\%hsdbname%\localize
	SET copy_loc_strings=1
)
IF %copy_loc_strings% (
	IF NOT EXIST %localizedir% (
		MKDIR %localizedir%
	)
	PUSHD %localizedir%
	SET localizedir=%CD%
	POPD
)
:: Use a random suffix to avoid collisions
SET tempsuffix=%RANDOM%
SET builtshare=hsui_built_%hsprojectname%_%tempsuffix%

:: Make sure that builtdir is clean
:: We use NET SHARE to reduce the directory depth because Windows can struggle with paths below node_modules,
:: and this approach allows us to get a drive letter allocated without us being susceptible to timing problems
:: if we try to find an unused drive letter and then use SUBST.
IF EXIST %builtdir% (
	NET SHARE %builtshare%=%builtroot% /GRANT:%USERNAME%,FULL /USERS:1
	PUSHD \\localhost\%builtshare%
	IF EXIST %hsprojectname% (
		RMDIR /S /Q %hsprojectname%
	)
	POPD
	NET share %builtshare% /DELETE /YES
	RMDIR /S /Q %builtdir%
)
:: Copy all files to built\projectname and make writable
ROBOCOPY %hsuidir% %builtdir% /S /A-:R /NP %ROBOCOPYLOGGING%

:: Python needs to precede the path to any other versions of python, especially if we're in Cygwin
:: Also set PYTHON environment variable
IF NOT "%pythonpath%"=="" (
	SET PATH=%pythonpath%;%PATH%
	SET PYTHON=%pythonpath%\python.exe
)

SET uishare=hsui_%hsprojectname%_%tempsuffix%

:: Use NET SHARE to allocate temp drive letters
:: For the actual source code
NET SHARE %uishare%=%builtdir% /GRANT:%USERNAME%,FULL /USERS:1
PUSHD \\localhost\%uishare%
SET popuishare=1
SET uisharedir=%CD%

:: Add node executable to PATH
SET nodedir=%uisharedir%\%builddepdir%\node-%nodeversion%-win-x86-exe
SET PATH=%PATH%;%nodedir%

:: Add npm bin directory to PATH
SET npmdir=%uisharedir%\%builddepdir%\npm-%npmversion%
SET PATH=%PATH%;%npmdir%\bin

:: Copy npm into node\node_modules\npm
ROBOCOPY %npmdir% %nodedir%\node_modules\npm /S /NP %ROBOCOPYLOGGING%

:: Add portablegit cmd directory to PATH
SET portablegitdir=%uisharedir%\%builddepdir%\portablegit-%portablegitversion%-win-x86-exe
SET PATH=%PATH%;%portablegitdir%\cmd

:: Remove any existing content in node_modules
IF EXIST %uisharedir%\node_modules (
	RMDIR /S /Q %uisharedir%\node_modules
)

:: Specify use of local npm cache
SET npm_config_cache=%uisharedir%\.npm-cache

:: Remove any existing data in local npm cache
IF EXIST %npm_config_cache% (
	RMDIR /S /Q %npm_config_cache%
)

:: Build dependencies
SET NODE_PATH=%nodedir%\node_modules
SET PATH=%PATH%%CD%node_modules\.bin;

SET npmloglevel=warn
IF "%MODE%"=="debug" (
	SET npmloglevel=silly
)

:: Add debugging to get more details about actual build environment
IF "%MODE%"=="debug" (
	ECHO Debugging node/npm environment...
	CALL node --version
	CALL npm --version
	CALL npm config get cache
	CALL where python
	CALL python --version
	ECHO %PYTHON%
)

:: If isc-tools\npm-shrinkwrap-online.json is present, overwrite npm-shrinkwrap.json with that file
IF EXIST %uisharedir%\isc-tools\npm-shrinkwrap-online.json (
	IF EXIST npm-shrinkwrap.json (
		DEL /F /Q npm-shrinkwrap.json
	)
	COPY /Y isc-tools\npm-shrinkwrap-online.json npm-shrinkwrap.json
	IF ERRORLEVEL 1 (
		SET RETURNCODE=1
		GOTO End
	)
)

:: Run npm install in:
::  1. root directory
::  2. src/components/foundation/base
::  3. src/common
::  4. src/app

CALL :RunNpmInstall %CD%
IF ERRORLEVEL 1 (
	SET RETURNCODE=1
	GOTO End
)

CALL :RunNpmInstall %uisharedir%\src\components\foundation\base
IF ERRORLEVEL 1 (
	SET RETURNCODE=1
	GOTO End
)

CALL :RunNpmInstall %uisharedir%\src\common
IF ERRORLEVEL 1 (
	SET RETURNCODE=1
	GOTO End
)

CALL :RunNpmInstall %uisharedir%\src\app
IF ERRORLEVEL 1 (
	SET RETURNCODE=1
	GOTO End
)

@ECHO ON

:: Make sure we are in the UI root directory
CD %uisharedir%

IF EXIST www (
	RMDIR /S /Q www
)
IF EXIST dist (
	RMDIR /S /Q dist
)

:: Run gulp (deploy|build)
CALL gulp %gulpbuildcommand%
IF ERRORLEVEL 1 (
	SET RETURNCODE=1
	GOTO End
)

:: Cleanup tag that ALL code paths should exit through
:: Needed to make sure that we correctly clean up any network shares that linger
:: and change back into the original directory
:End
@ECHO ON

IF "%popuishare%"=="1" (
	POPD
)
IF NOT "%uishare%" == "" (
	NET share %uishare% /delete /yes
)

SET path=%oldpath%
CD %origdir%

EXIT /B %RETURNCODE%

:: End of main routine
:: ----------------------------------------------------

:: Sub-routine to perform npm install in a target directory specified in argument 1
:RunNpmInstall

PUSHD %1

ECHO Running 'npm install --loglevel %npmloglevel%' in directory '%CD%'

CALL npm install --loglevel %npmloglevel% || EXIT /B 1
@ECHO ON

POPD

EXIT /B 0