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
import { hash, compare } from "bcryptjs";
import { User } from "../entity/User";
import { AppContext } from "../types/AppCntext";
import { createAccessToken, createRefreshToken } from "../auth";
import { isAuth } from "../Middlewares/isAuth";
import { sendRefreshToken } from "../sendRefreshToken";

@ObjectType()
export class LoginResponse {
    @Field()
    accessToken: string;
}

@Resolver()
export class UserResolver {
    @Query(() => String)
    async me(): Promise<String> {
        return "hi!";
    }

    @Query(() => String)
    @UseMiddleware(isAuth)
    async logout(@Ctx() { payload }: AppContext) {
        console.log(payload);

        return `your user id is: ${payload!.userId}`;
    }

    @Query(() => [User])
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
            throw new Error("could not find user");
        }

        const valid = await compare(password, user.password);

        if (!valid) {
            throw new Error("Bad password");
        }

        sendRefreshToken(res, createRefreshToken(user));

        return {
            accessToken: createAccessToken(user),
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
