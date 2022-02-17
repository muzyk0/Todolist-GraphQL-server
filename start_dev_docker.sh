#!/usr/bin/bash

cd ./deploy/dev && \
docker-compose -p todolist-graphql-server \
    up --build