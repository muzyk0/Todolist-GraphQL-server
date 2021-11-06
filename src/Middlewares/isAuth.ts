import { verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { AppContext } from "../types/AppCntext";

// bearer sfwe9r0ewfijosdklf

export interface UserAccessTokenPayload {
    userId: number;
}

export const isAuth: MiddlewareFn<AppContext> = async ({ context }, next) => {
    const authorization: string | undefined =
        context.req.headers["authorization"];

    // const authorization = context.req.headers.get("authorization");

    console.log(context.req.headers);

    if (!authorization) {
        throw new Error("not authenticated");
    }

    try {
        const token = authorization?.split(" ")[1];
        const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
        context.payload = payload as UserAccessTokenPayload;
    } catch (error) {
        console.log(error);
        throw new Error("not authenticated");
    }

    return next();
};
