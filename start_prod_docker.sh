#!/usr/bin/bash

cd ./deploy/prod && \
docker-compose -p todolist-graphql-server \
    up --build