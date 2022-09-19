#!/bin/sh

echo '**************************************************'
echo '* Getting an API token...                        *'
echo '**************************************************'

export IPINFO_API_TOKEN=`node dist/api/bin/getApiTokenForUi.js`

echo '**************************************************'
echo '* Building the client...                         *'
echo '**************************************************'

npm run client:build

echo '**************************************************'
echo '* Restarting nginx...                            *'
echo '**************************************************'

service nginx restart
