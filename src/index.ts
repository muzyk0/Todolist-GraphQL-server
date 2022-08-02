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
import {ConnectionOptions, createConnection, getConnectionOptions} from "typeorm";

import cookieParser from "cookie-parser";
import { PostRefreshToken } from "./routes/PostRefreshToken";
import cors from "cors";
import * as fs from "fs";

const PORT: string = process.env.PORT ?? "5000";

const databaseUrl: string = process.env.DATABASE_URL ?? '';

const getOptions = async () => {
    let connectionOptions: ConnectionOptions;
    connectionOptions = {
        type: 'postgres',
        extra: {
            ssl: true,
        },
        synchronize: false,
        logging: false,
        entities: ["dist/entity/**/*.js"],
        migrations: ["dist/migration/**/*.js"],
        subscribers: ["dist/subscriber/**/*.js"],
        cli: {
            "entitiesDir": "src/entity",
            "migrationsDir": "src/migration",
            "subscribersDir": "src/subscriber"
        }
    };
    if (process.env.DATABASE_URL) {
        Object.assign(connectionOptions, { url: databaseUrl });
    } else {
        // gets your default configuration
        // you could get a specific config by name getConnectionOptions('production')
        // or getConnectionOptions(process.env.NODE_ENV)
        connectionOptions = await getConnectionOptions();
    }

    return connectionOptions;
};

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

        const typeOrmConfig = await getOptions();
        await createConnection(typeOrmConfig);

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
