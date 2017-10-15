#!/bin/sh

PRODUCT_KEY=`echo $1 | awk '{print toupper($0)}'`
PRODUCT_INC_FILE=$2
BUILD_INC_FILE=$3

BUILD_EXPRESSION="#define HSBUILDNUMBER\s+\\\"?([[:digit:]]+)\\\"?"
PRODUCT_MAJOR_EXPRESSION="#define ${PRODUCT_KEY}(m|M)ajorVersion\s+\\\"?([[:digit:]]+)\\\"?"
PRODUCT_MINOR_EXPRESSION="#define ${PRODUCT_KEY}(m|M)inorVersion\s+\\\"?([[:digit:]]+(-|\w|_|[[:digit:]])*)\\\"?"


# The version of grep in the build environment is ancient, so we need to be 
# REALLY defensive about the patterns we feed it - it doesn't seem to like \s or \t
# so we use the explicit space and tab characters after the define keys
# More specifically, we use ( |	) instead of ( |\t) or \s+
BUILD_NUMBER=`grep -E "#define HSBUILDNUMBER( |	)" "$BUILD_INC_FILE" | sed -E -e "s/${BUILD_EXPRESSION}\s*/\1/"`
PRODUCT_MAJOR=`grep -E "#define ${PRODUCT_KEY}(m|M)ajorVersion( |	)" "$PRODUCT_INC_FILE" | sed -E -e "s/${PRODUCT_MAJOR_EXPRESSION}\s*/\2/"`
PRODUCT_MINOR=`grep -E "#define ${PRODUCT_KEY}(m|M)inorVersion( |	)" "$PRODUCT_INC_FILE" | sed -E -e "s/${PRODUCT_MINOR_EXPRESSION}\s*/\2/"`


# The label logic below originates from the build environment
if [ "$uselabel" != "" ]
then
	CHANGE_DESCRIPTOR="$labelname"
else
	CHANGE_DESCRIPTOR="$usechange"
fi


VERSION_JSON="{ \"uifw-nightly-version\": {
  \"release\": \"$PRODUCT_MAJOR.$PRODUCT_MINOR\",
  \"major\": \"$PRODUCT_MAJOR\",
  \"minor\": \"$PRODUCT_MINOR\",
  \"build\": \"$BUILD_NUMBER\",
  \"change\": \"$CHANGE_DESCRIPTOR\"
}}"

echo $VERSION_JSON