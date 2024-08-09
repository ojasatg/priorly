import type { Request, Response } from "express";
import _ from "lodash";
import {
    EditUserRequestSchema,
    EditUserResponseSchema,
    EServerResponseCodes,
    EServerResponseRescodes,
} from "shared";

import UserModel from "../models/UserModel";
import { logURL } from "../utils/logger.utils";
import { invalidateSession } from "../utils/auth.utils";

export async function edit(req: Request, res: Response) {
    logURL(req);
    const todoId = req.query.id as string; // taking id in query
    // todo: use headers.token to get user information

    const changes = req.body?.changes;

    if (!todoId) {
        // todo: if not logged in send not authorised
        // todo: this kind of check should be in a middleware
        return res.status(EServerResponseCodes.FORBIDDEN).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Please log in to continue",
            error: "Forbidden",
        });
    }

    if (_.isEmpty(changes)) {
        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to update the user information",
            error: "Bad request: No changes sent to update",
        });
    }

    try {
        EditUserRequestSchema.parse(changes);
    } catch (error) {
        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to update the user information",
            error: "Bad request: Changes contain invalid fields and/or values",
        });
    }

    // todo: get user id from the token and other details from that you'll get the id
    const userEmail = ""; // todo: get the email by decoding the token

    let user;
    try {
        // if todo is deleted then forbid other changes other than recovery
        user = await UserModel.findOne({ email: userEmail });

        if (_.isEmpty(user)) {
            return res.status(EServerResponseCodes.NOT_FOUND).json({
                rescode: EServerResponseRescodes.ERROR,
                message: "User not found, please sign up",
                error: "User does not exist",
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unknown error occured, please try again later",
            error: "Internal Server Error",
        });
    }

    const userId = user.id; // todo: set the id here by decoding the token and finding by email - also check for email

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set: changes },
            { new: true }, // returns the updated todo otherwise old todo
        );
        if (_.isEmpty(updatedUser)) {
            return res.status(EServerResponseCodes.NOT_FOUND).json({
                rescode: EServerResponseRescodes.ERROR,
                message: "Unable to update the user information",
                error: "Requested item does not exist",
            });
        } else {
            const user = EditUserResponseSchema.parse(updatedUser);
            return res.status(EServerResponseCodes.OK).json({
                rescode: EServerResponseRescodes.SUCCESS,
                message: "User information updated successfully",
                data: {
                    user: user,
                },
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to update the user information",
            error: "Internal Server Error",
        });
    }
}

export async function remove(req: Request, res: Response) {
    logURL(req);

    const userID = req.query.userID as string; // taking id in query from the isAuthenticated middleware

    try {
        await UserModel.findByIdAndDelete(userID);

        const sid = req.query.sid as string;
        await invalidateSession(sid);
        res.cookie("sid", ""); // clear the auth cookie

        return res.status(EServerResponseCodes.OK).json({
            rescode: EServerResponseRescodes.SUCCESS,
            message: "User deleted successfully",
            data: {},
        });
    } catch (error) {
        console.error(error);
        return res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unknown error occured, please try again later",
            error: "Internal Server Error",
        });
    }
}

const UserController = {
    edit,
    remove,
};

export default UserController;
