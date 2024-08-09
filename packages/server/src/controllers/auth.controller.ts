import type { CookieOptions, Request, Response } from "express";
import bcrypt from "bcrypt";
import _ from "lodash";
import type { ZodError } from "zod";

import {
    CreateUserRequestSchema,
    EServerResponseCodes,
    EServerResponseRescodes,
    getFormattedZodErrors,
    getFormattedMongooseErrors,
    type TMongooseError,
    LoginUserRequestSchema,
} from "shared";

import UserModel from "../models/UserModel";
import { invalidateSession, setUserSession } from "../utils/auth.utils";
import { logURL } from "../utils/logger.utils";

const AUTH_COOKIE: CookieOptions = {
    secure: true,
    httpOnly: true,
    maxAge: 3 * 24 * 60 * 60, // expires in 3 days
    sameSite: "strict",
};

async function signup(req: Request, res: Response) {
    logURL(req);
    let userDetails = req.body;

    if (_.isEmpty(userDetails)) {
        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to create user",
            error: "Bad request: Sufficient data not available",
        });
    }

    try {
        userDetails = CreateUserRequestSchema.parse(userDetails);
    } catch (error) {
        const errors = getFormattedZodErrors(error as ZodError);

        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to create user",
            error: "Bad request: Invalid data",
            errors,
        });
    }

    try {
        delete userDetails.confirmPassword;

        const createdUser = await UserModel.create(userDetails);

        const sid = await setUserSession(createdUser.id);
        return res
            .cookie("sid", sid, AUTH_COOKIE)
            .status(EServerResponseCodes.CREATED)
            .json({
                rescode: EServerResponseRescodes.SUCCESS,
                message: "User signup successful",
            });
    } catch (error) {
        const { code, errors } = getFormattedMongooseErrors(
            error as TMongooseError,
        );

        return res.status(code).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to signup",
            error: "Internal server error",
            errors,
        });
    }
}

async function login(req: Request, res: Response) {
    logURL(req);
    let userDetails = req.body;

    if (_.isEmpty(userDetails)) {
        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to create user",
            error: "Bad request: Sufficient data not available",
        });
    }

    try {
        userDetails = LoginUserRequestSchema.parse(userDetails);
    } catch (error) {
        const errors = getFormattedZodErrors(error as ZodError);

        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to login user",
            error: "Bad request: Invalid data",
            errors,
        });
    }

    try {
        const { email, password } = userDetails;
        const foundUser = await UserModel.findOne({ email: email });

        if (!_.isEmpty(foundUser)) {
            const passwordMatched = await bcrypt.compare(
                password,
                foundUser.password,
            );

            if (passwordMatched) {
                const sid = await setUserSession(foundUser.id);

                return res
                    .cookie("sid", sid, AUTH_COOKIE)
                    .status(EServerResponseCodes.OK)
                    .json({
                        rescode: EServerResponseRescodes.SUCCESS,
                        message: "User logged in",
                    });
            } else {
                return res.status(EServerResponseCodes.UNAUTHORIZED).json({
                    rescode: EServerResponseRescodes.ERROR,
                    message: "The password is incorrect",
                    error: "Wrong password",
                });
            }
        } else {
            return res.status(EServerResponseCodes.NOT_FOUND).json({
                rescode: EServerResponseRescodes.ERROR,
                message: "No user found with this email",
                error: "Requested item does not exist",
            });
        }
    } catch (error) {
        return res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to login",
            error: "Internal server error",
        });
    }
}

async function logout(req: Request, res: Response) {
    logURL(req);
    try {
        const sid = req.query.sid as string;
        await invalidateSession(sid);
        res.cookie("sid", ""); // clear the auth cookie

        return res.status(EServerResponseCodes.OK).json({
            rescode: EServerResponseRescodes.SUCCESS,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to logout",
            error: "Internal server error",
        });
    }
}

const AuthController = {
    signup,
    login,
    logout,
};

export default AuthController;
