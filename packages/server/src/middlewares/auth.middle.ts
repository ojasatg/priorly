import type { NextFunction, Request, Response } from "express";

export function isAuthenticated(
    req: Request,
    _res: Response,
    next: NextFunction,
) {
    // check the session id (sid) from cookie
    const sid = req.cookies.sid;
    console.log("sid: ", sid);

    // if not session then not authenticated

    // get the csrf token from header

    // if csrf token matches from the header then authenticated, else not authenticated

    // if user not logged in, send unauthenticated error

    // if user logged in, find user id from sessions table and pass the user id, sid, and csrf token

    next();
}
