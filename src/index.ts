import "dotenv/config";
import "reflect-metadata";

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

        await createConnection();

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

        app.listen(5000, () => {
            console.log("Express server started in 5000");
        });
    } catch (error) {
        console.log(error);
    }
})();
