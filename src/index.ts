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

(async () => {
    const app = express();
    app.use(cookieParser());
    app.get("/", (_req, res) => {
        res.send("Hello");
    });

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

    await apolloServer.applyMiddleware({ app });

    app.listen(5000, () => {
        console.log("Express server started in 5000");
    });
})();

// createConnection()
//     .then(async (connection) => {
//         console.log("Inserting a new user into the database...");
//         const user = new User();
//         user.firstName = "Timber";
//         user.lastName = "Saw";
//         user.age = 25;
//         await connection.manager.save(user);
//         console.log("Saved a new user with id: " + user.id);

//         console.log("Loading users from the database...");
//         const users = await connection.manager.find(User);
//         console.log("Loaded users: ", users);

//         console.log(
//             "Here you can setup and run express/koa/any other framework."
//         );
//     })
//     .catch((error) => console.log(error));
