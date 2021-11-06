# Awesome Project Build with TypeORM

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `ormconfig.json` file
3. Run `npm start` command

## Generate .env type

1. Install gen-env-types
2. Run `npx gen-env-types .env -o src/types/env.d.ts -e .` or
3. Run `npx gen-env-types .env -o src/types/env.d.ts -e . -r .env.template` width .env.template
