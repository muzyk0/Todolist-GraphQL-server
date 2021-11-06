import express, { Response } from "express";
import { verify } from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "../auth";
import { User } from "../entity/User";
import { sendRefreshToken } from "../sendRefreshToken";

const router = express.Router();

export interface RefreshTokenResponse {
    ok: boolean;
    accessToken: string;
}

export const PostRefreshToken = router.post(
    "/refresh_token",
    async (req, res: Response<RefreshTokenResponse>) => {
        const token = req.cookies.tdl;
        if (!token) {
            return res.send({ ok: false, accessToken: "" });
        }
        let payload: any = null;
        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
        } catch (error) {
            console.log(error);
            return res.send({ ok: false, accessToken: "" });
        }

        // token is valid and
        // we can send back an access token
        const user = await User.findOne({ id: payload.userId });

        if (!user) {
            return res.send({ ok: false, accessToken: "" });
        }

        if (user.tokenVersion !== payload.tokenVersion) {
            return res.send({ ok: false, accessToken: "" });
        }

        sendRefreshToken(res, createRefreshToken(user));

        return res.send({ ok: true, accessToken: createAccessToken(user) });
    }
);
