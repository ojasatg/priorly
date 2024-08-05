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
} from "shared";

import UserModel from "../models/UserModel";

// Signup actually creates the user so it has to be here
async function signup(req: Request, res: Response) {
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
        // todo: do not receive username and passwords in request body

        delete userDetails.confirmPassword;
        // todo: Store password as a hash

        const createdUser = await UserModel.create(userDetails);
        const user = CreateUserResponseSchema.parse(createdUser); // strips unnecessary keys

        // todo: send token in headers instead of id in body

        return res.status(EServerResponseCodes.CREATED).json({
            rescode: EServerResponseRescodes.SUCCESS,
            message: "User created succesfully",
            data: {
                user: user,
            },
        });
    } catch (error) {
        const { code, errors } = getFormattedMongooseErrors(
            error as TMongooseError,
        );

        return res.status(code).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to create user",
            error: "Internal Server Error",
            errors,
        });
    }
}

// todo: Signup and login response schema should be the same - both send nothing, but token in the headers
async function login(_req: Request, res: Response) {
    return res.status(EServerResponseCodes.OK).json({
        message: "Logged in successfully",
    });
}
async function logout(_req: Request, res: Response) {
    return res.status(EServerResponseCodes.OK).json({
        message: "Logged out successfully",
    });
}

const AuthController = {
    signup,
    login,
    logout,
};

export default AuthController;
