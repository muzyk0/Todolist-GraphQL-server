import { ApolloError } from "apollo-server-express";
import { compare, hash } from "bcryptjs";
import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    InputType,
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
import { Todolist } from "../entity/Todolist";
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

@InputType()
export class UpdatePasswordInput {
    @Field()
    currentPassword: string;

    @Field()
    newPassword: string;
}

@Resolver(User)
export class UserResolver {
    @FieldResolver(() => [Todolist])
    @UseMiddleware(isAuth)
    async todolists(@Ctx() ctx: AppContext): Promise<Todolist[]> {
        return await Todolist.find({
            where: {
                userId: ctx.payload!.userId,
            },
        });
    }

    @Query(() => User, { nullable: true })
    async me(@Ctx() ctx: AppContext): Promise<User | undefined> {
        const userId = getPayloadFromContext(ctx)?.userId;

        if (!userId) {
            return;
        }

        return User.findOne(userId);
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

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    @Transaction()
    async updatePassword(
        @TransactionManager() m: EntityManager,
        @Ctx() ctx: AppContext,
        @Arg("data", () => UpdatePasswordInput)
        { currentPassword, newPassword }: UpdatePasswordInput
    ): Promise<boolean> {
        const user = await m.findOne(User, ctx.payload!.userId);

        if (!user) {
            throw new ApolloError("could not find user");
        }

        const valid = await compare(currentPassword, user.password);

        if (!valid) {
            throw new Error("Bad password");
        }

        const hashedPassword = await hash(newPassword, 12);

        user.password = hashedPassword;
        m.save(user);

        return true;
    }

    @Mutation(() => LoginResponse)
    @Transaction()
    async login(
        @TransactionManager() m: EntityManager,
        @Ctx() { res }: AppContext,
        @Arg("email") email: string,
        @Arg("password") password: string
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
