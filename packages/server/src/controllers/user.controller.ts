import type { Request, Response } from "express";
import _ from "lodash";
import bcrypt from "bcrypt";

import {
    ChangeUserPasswordSchema,
    EditUserRequestSchema,
    EServerResponseCodes,
    EServerResponseRescodes,
    type TChangeUserPasswordSchema,
} from "shared";

import UserModel from "../models/UserModel";
import { logURL } from "../utils/logger.utils";
import { invalidateSession } from "../utils/auth.utils";

export async function edit(req: Request, res: Response) {
    logURL(req);
    const userID = req.query.userID;

    const changes = req.body?.changes;

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

    try {
        // if todo is deleted then forbid other changes other than recovery
        const updatedUser = await UserModel.findByIdAndUpdate(
            userID,
            { $set: changes },
            { new: true },
        );

        if (!_.isEmpty(updatedUser)) {
            return res.status(EServerResponseCodes.OK).json({
                rescode: EServerResponseRescodes.SUCCESS,
                message: "User details updated successfully",
                data: {
                    user: {
                        name: updatedUser.name,
                        email: updatedUser.email,
                    },
                },
            });
        } else {
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
            error: "Internal server error",
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
        });
    } catch (error) {
        console.error(error);
        return res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unknown error occured, please try again later",
            error: "Internal server error",
        });
    }
}

export async function changePassword(req: Request, res: Response) {
    logURL(req);

    const details = req.body as TChangeUserPasswordSchema;

    try {
        ChangeUserPasswordSchema.parse(details);
    } catch (error) {
        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to change the password",
            error: "Bad request: Invalid data",
        });
    }

    try {
        const userID = req.query.userID as string;
        const { currentPassword, newPassword } = details;

        const foundUser = await UserModel.findById(userID);

        if (!_.isEmpty(foundUser)) {
            const passwordMatched = await bcrypt.compare(
                currentPassword,
                foundUser.password,
            );

            if (passwordMatched) {
                await UserModel.findByIdAndUpdate(userID, {
                    $set: { password: newPassword },
                });
                return res.status(EServerResponseCodes.OK).json({
                    rescode: EServerResponseRescodes.SUCCESS,
                    message: "Password changed successfully",
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
            message: "Unable to change the password",
            error: "Internal server error",
        });
    }
}

const UserController = {
    edit,
    remove,
    changePassword,
};

export default UserController;
