#!/bin/sh

echo '**************************************************'
echo '* Generating Artillery CSV...                    *'
echo '**************************************************'

node dist/api/bin/generateArtilleryCsv.js

echo '**************************************************'
echo '* Running Artillery...                           *'
echo '**************************************************'

npm run stress-test

echo '**************************************************'
echo '* Generating Report...                           *'
echo '**************************************************'

npm run stress-test:report
