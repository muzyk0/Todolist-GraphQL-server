import { ApolloError } from "apollo-server-express";
import { compare, hash } from "bcryptjs";
import {
    Arg,
    Ctx,
    Field,
    Int,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import {
    EntityManager,
    getConnection,
    Transaction,
    TransactionManager,
} from "typeorm";
import {
    createAccessToken,
    createRefreshToken,
    getPayloadFromContext,
} from "../auth";
import { User } from "../entity/User";
import { isAuth } from "../Middlewares/isAuth";
import { sendRefreshToken } from "../sendRefreshToken";
import { AppContext } from "../types/AppCntext";

@ObjectType()
export class LoginResponse {
    @Field()
    accessToken: string;

    @Field(() => User)
    user: User;
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    @Transaction()
    async me(
        @Ctx() ctx: AppContext,
        @TransactionManager() m: EntityManager
    ): Promise<User | undefined> {
        const userId = getPayloadFromContext(ctx)?.userId;

        if (!userId) {
            return;
        }

        return m.findOne(User, userId);
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async logout(@Ctx() { res }: AppContext): Promise<boolean> {
        sendRefreshToken(res, "");

        return true;
    }

    @Query(() => [User])
    @UseMiddleware(isAuth)
    @Transaction()
    async users(@TransactionManager() m: EntityManager): Promise<User[]> {
        const users = await m.find(User, {
            order: {
                id: "ASC",
            },
        });
        return users;
    }

    @Mutation(() => Boolean)
    async revokeRefreshTokensForUser(
        @Arg("userId", () => Int) userId: number
    ): Promise<boolean> {
        await getConnection()
            .getRepository(User)
            .increment({ id: userId }, "tokenVersion", 1);
        return true;
    }

    @Mutation(() => LoginResponse)
    @Transaction()
    async login(
        @TransactionManager() m: EntityManager,
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Ctx() { res }: AppContext
    ): Promise<LoginResponse> {
        const user = await m.findOne(User, {
            where: { email },
        });

        if (!user) {
            throw new ApolloError("could not find user");
        }

        const valid = await compare(password, user.password);

        if (!valid) {
            throw new Error("Bad password");
        }

        sendRefreshToken(res, createRefreshToken(user));

        return {
            accessToken: createAccessToken(user),
            user,
        };
    }

    @Mutation(() => User)
    @Transaction()
    async register(
        @TransactionManager() m: EntityManager,
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Arg("name") name: string
    ): Promise<User> {
        const hashedPassword = await hash(password, 12);

        const user = m.create(User, {
            email,
            password: hashedPassword,
            name,
        });
        return m.save(user);
    }
}
