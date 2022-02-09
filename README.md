# Awesome Project Build with TypeORM

Steps to run this project:

1. Copy .env.example and rename to .env
2. Edit ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET
3. Run `bash init_docker_db.sh` command
4. Run `docker-compose -p todolist-graphql-server up --build` command

## Generate .env type

1. Install gen-env-types
2. Run `npx gen-env-types .env -o src/types/env.d.ts -e .` or
3. Run `npx gen-env-types .env -o src/types/env.d.ts -e . -r .env.template` width .env.template

# Docker and Docker compose

0. Create initial DB `docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -d postgres`
1. Create docker instance `docker build -t todolist-graphql-server .`
2. Start docker-compose `docker-compose up`
3. Stop docker-compose `docker-compose down`
