#!/bin/bash
set -euxo pipefail

npm run build
cdk bootstrap aws://427808209930/us-east-2 --profile 95horatio
cdk deploy CoreStack --require-approval never --profile 95horatio
cdk deploy StorageStack --require-approval never --profile 95horatio
cdk deploy AuthStack --require-approval never --profile 95horatio
cdk deploy BotStack --require-approval never --profile 95horatio
cdk deploy WebStack --require-approval never --profile 95horatio