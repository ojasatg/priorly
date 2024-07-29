import type { Request, Response } from "express";
import _ from "lodash";

import {
    EServerResponseRescodes,
    EServerResponseCodes,
    CreateTodoResponseSchema,
} from "shared";

import { logURL } from "../utils/logger.utils";

import TodoModel from "../models/TodoModel";

async function create(req: Request, res: Response) {
    logURL(req);
    const reqTodo = req.body;

    if (_.isEmpty(reqTodo)) {
        res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to create todo",
            error: "Bad request: Sufficient data not available",
        });
        return;
    }

    try {
        const createdTodo = await TodoModel.create(reqTodo);
        const todo = CreateTodoResponseSchema.parse(createdTodo); // strips unnecessary keys

        res.status(EServerResponseCodes.CREATED).json({
            rescode: EServerResponseRescodes.SUCCESS,
            message: "Todo created succesfully",
            data: {
                todo: todo,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to add todo",
            error: "Internal Server Error",
        });
    }
}

const TodoController = {
    create,
};

export default TodoController;
