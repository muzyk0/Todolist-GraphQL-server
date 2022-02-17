#!/usr/bin/bash

cd ./prod && \
docker-compose -p todolist-graphql-server \
    up --build