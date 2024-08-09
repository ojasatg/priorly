import type { NextFunction, Request, Response } from "express";
import _ from "lodash";

import { sessionStorage } from "../storage";
import { EServerResponseCodes, EServerResponseRescodes } from "shared";

import UserModel from "../models/UserModel";

export async function isAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const sid = req.cookies.sid;
        const isValidSID = await sessionStorage.hasItem(sid);

        if (!sid || !isValidSID) {
            return res.status(EServerResponseCodes.FORBIDDEN).json({
                rescode: EServerResponseRescodes.ERROR,
                message: "Please login to continue",
                error: "User not logged in",
            });
        } else {
            const userID = (await sessionStorage.getItem(sid)) as string;
            const user = await UserModel.findById(userID);

            if (!_.isEmpty(user)) {
                req.query.userID = userID;
                req.query.sid = sid;
                next();
            } else {
                return res.status(EServerResponseCodes.NOT_FOUND).json({
                    rescode: EServerResponseRescodes.ERROR,
                    message: "User not found",
                    error: "Requested item does not exist",
                });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            error: "Internal server error",
            message: "Cannot establish user identity",
        });
    }
}
