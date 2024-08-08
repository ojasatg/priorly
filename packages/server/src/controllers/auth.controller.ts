import type { Request, Response } from "express";
import _ from "lodash";
import type { ZodError } from "zod";

import {
    CreateUserResponseSchema,
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

// Signup actually creates the user so it has to be here
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
        CreateUserResponseSchema.parse(createdUser); // strips unnecessary keys

        const sid = await setUserSession(createdUser.id);
        return res
            .cookie("sid", sid, {
                secure: true,
                httpOnly: true,
                maxAge: 3 * 24 * 60 * 60, // expires in 3 days
                sameSite: "strict",
            })
            .status(EServerResponseCodes.CREATED)
            .json({
                rescode: EServerResponseRescodes.SUCCESS,
                message: "User signup successful",
                data: {},
            });
    } catch (error) {
        const { code, errors } = getFormattedMongooseErrors(
            error as TMongooseError,
        );

        return res.status(code).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to signup",
            error: "Internal Server Error",
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
            // todo check for password

            const sid = await setUserSession(foundUser.id);

            return res
                .cookie("sid", sid, {
                    secure: true,
                    httpOnly: true,
                    maxAge: 3 * 24 * 60 * 60, // expires in 3 days
                    sameSite: "strict",
                })
                .status(EServerResponseCodes.OK)
                .json({
                    rescode: EServerResponseRescodes.SUCCESS,
                    message: "User logged in",
                    data: {},
                });
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
            error: "Internal Server Error",
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
            data: {},
        });
    } catch (error) {
        console.error(error);
        return res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to logout",
            error: "Internal Server Error",
        });
    }
}

const AuthController = {
    signup,
    login,
    logout,
};

export default AuthController;
