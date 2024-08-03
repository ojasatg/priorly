import type { Request, Response } from "express";
import _ from "lodash";
import {
    CreateUserResponseSchema,
    CreateUserSchemaRequest,
    EServerResponseCodes,
    EServerResponseRescodes,
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
        userDetails = CreateUserSchemaRequest.parse(userDetails);
    } catch (error) {
        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to create user",
            error: "Bad request: Invalid data",
        });
    }

    try {
        // todo: Delete confirm password key
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
        console.error(error);
        return res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to create user",
            error: "Internal Server Error",
        });
    }
}

// todo: Signup and login response schema should be the same - both send nothing, but token in the headers
async function login() {}
async function logout() {}

const AuthController = {
    signup,
    login,
    logout,
};

export default AuthController;
