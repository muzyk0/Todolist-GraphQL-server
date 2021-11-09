import { sign, verify } from "jsonwebtoken";
import { User } from "./entity/User";
import { UserAccessTokenPayload } from "./Middlewares/isAuth";
import { AppContext } from "./types/AppCntext";

export const createAccessToken = (user: User) => {
    return sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: process.env.NODE_ENV === "dev" ? "1y" : "15m",
    });
};

export const createRefreshToken = (user: User) => {
    return sign(
        { userId: user.id, tokenVersion: user.tokenVersion },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: "7d",
        }
    );
};

export const getPayloadFromContext = (
    context: AppContext
): UserAccessTokenPayload | null => {
    const authorization = context.req.headers["authorization"];

    if (!authorization) {
        return null;
    }

    try {
        const token = authorization.split(" ")[1];
        return verify(
            token,
            process.env.ACCESS_TOKEN_SECRET!
        ) as UserAccessTokenPayload;
    } catch {
        return null;
    }
};
