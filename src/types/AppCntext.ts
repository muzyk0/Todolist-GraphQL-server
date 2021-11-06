import { Request, Response } from "express";
import { UserAccessTokenPayload } from "../Middlewares/isAuth";

export interface AppContext {
    req: Request;
    res: Response;
    payload?: UserAccessTokenPayload;
    [extra: string]: any;
}
