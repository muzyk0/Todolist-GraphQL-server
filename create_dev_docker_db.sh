#!/usr/bin/bash

# Этот скрипт запускается один раз, при развертывании системы на машине разработчика

# cd ./deploy/dev-local && \
docker-compose -p todolist-graphql-server build && \
docker-compose -p todolist-graphql-server up -d postgres && \
sleep 5 # надо дать время базе данных на загрузку и подготовку к работе
echo postgrespassword | docker-compose -p todolist-graphql-server run --rm --no-deps postgres psql -h postgres -U postgres -c "CREATE DATABASE test;"
# echo postgrespassword | docker-compose -p todolist-graphql-server run --rm --no-deps postgres psql -h postgres -U postgres -c "CREATE DATABASE testing;"
echo 'rm -rf dist/* && yarn tsc && yarn typeorm migration:run' | docker-compose -p todolist-graphql-server run --rm server sh 
docker-compose -p todolist-graphql-server down
# docker-compose -p todolist-graphql-server up
