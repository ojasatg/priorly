import type { NextFunction, Request, Response } from "express";

export function isAuthenticated(
    _req: Request,
    _res: Response,
    next: NextFunction,
) {
    // check the session id (sid) from cookie

    // get the csrf token from header

    // if user not logged in, send unauthenticated error

    // if user logged in, find user id from sessions table and pass the user id, sid, and csrf token

    next();
}
