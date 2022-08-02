import "dotenv/config";
import "reflect-metadata";
import * as PostgressConnectionStringParser from "pg-connection-string";

import express from "express";
import { ApolloServer } from "apollo-server-express";
import {
    ApolloServerPluginLandingPageDisabled,
    ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { buildSchema } from "type-graphql";
import resolvers from "./resolvers";
import { createConnection } from "typeorm";

import cookieParser from "cookie-parser";
import { PostRefreshToken } from "./routes/PostRefreshToken";
import cors from "cors";
import {PostgresConnectionOptions} from "typeorm/driver/postgres/PostgresConnectionOptions";
import * as fs from "fs";

const PORT: string = process.env.PORT ?? "5000";

const databaseUrl: string = process.env.DATABASE_URL ?? '';
const connectionOptions = PostgressConnectionStringParser.parse(databaseUrl);
const typeOrmOptions: PostgresConnectionOptions = {
    type: "postgres",
    name: connectionOptions.application_name,
    host: connectionOptions.host as string | undefined,
    port: connectionOptions.port as number | undefined,
    username: connectionOptions.user,
    password: connectionOptions.password,
    database: connectionOptions.database as string | undefined,
    extra: {
        ssl: true
    },
    "synchronize": false,
    "logging": false,
    "entities": ["dist/entity/**/*.js"],
    "migrations": ["dist/migration/**/*.js"],
    "subscribers": ["dist/subscriber/**/*.js"],
    "cli": {
        "entitiesDir": "src/entity",
        "migrationsDir": "src/migration",
        "subscribersDir": "src/subscriber"
    }
};

const json = JSON.stringify(typeOrmOptions, null, 2);
fs.writeFile("./ormconfig.json", json, (err) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("File has been created");
});

(async () => {
    try {
        const app = express();
        app.use(
            cors({
                credentials: true,
                origin: (_origin, callback) => callback(null, true),
            })
        );
        app.use(cookieParser());
        app.use(PostRefreshToken);

        await createConnection(typeOrmOptions);

        const apolloServer = new ApolloServer({
            schema: await buildSchema({
                resolvers,
            }),
            context: ({ req, res }) => ({ req, res }),
            plugins: [
                // Install a landing page plugin based on NODE_ENV
                process.env.NODE_ENV === "production"
                    ? ApolloServerPluginLandingPageDisabled()
                    : ApolloServerPluginLandingPageGraphQLPlayground(),
            ],
        });
        await apolloServer.start();
        apolloServer.applyMiddleware({ app, cors: false });

        app.listen(PORT, () => {
            console.log("Express server started in 5000");
        });
    } catch (error) {
        console.log(error);
    }
})();
