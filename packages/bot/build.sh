#!/bin/sh

set -euxo pipefail

cd HoratioBot
aws ecr get-login-password --region us-east-2 --profile 95horatio | docker login --username AWS --password-stdin 427808209930.dkr.ecr.us-east-2.amazonaws.com
docker build --pull -t horatio-bot ./
docker tag horatio-bot:latest 427808209930.dkr.ecr.us-east-2.amazonaws.com/horatio-bot
docker push 427808209930.dkr.ecr.us-east-2.amazonaws.com/horatio-bot
# aws --region us-east-2 --profile 95horatio ecs update-service --service BotStack-Service9571FDD8-vZXeOQIHjLhT --cluster BotStack-ClusterEB0386A7-KLnojgnlYG2l  --force-new-deployment
