import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import _ from "lodash";

import {
    EServerResponseRescodes,
    EServerResponseCodes,
    CreateTodoResponseSchema,
    CreateTodoRequestSchema,
    TodoDetailsResponseSchema,
    type TEditTodoChangesSchema,
    EditTodoChangesSchema,
    getCurrentTimeStamp,
} from "shared";

import { logURL } from "../utils/logger.utils";

import TodoModel from "../models/TodoModel";

async function create(req: Request, res: Response) {
    logURL(req);
    let reqTodo = req.body;

    if (_.isEmpty(reqTodo)) {
        res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to create todo",
            error: "Bad request: Sufficient data not available",
        });
        return;
    }

    try {
        reqTodo = CreateTodoRequestSchema.parse(reqTodo);
    } catch (error) {
        res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to create todo",
            error: "Bad request: Invalid data",
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
        return;
    } catch (error) {
        console.error(error);
        res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to add todo",
            error: "Internal Server Error",
        });
        return;
    }
}

async function details(req: Request, res: Response) {
    const todoId = req.query.id;

    if (!isValidObjectId(todoId)) {
        res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to fetch the todo details",
            error: "Bad request: Invalid id",
        });
        return;
    }

    try {
        const foundTodo = await TodoModel.findById(todoId);
        if (!_.isEmpty(foundTodo)) {
            const todo = TodoDetailsResponseSchema.parse(foundTodo);

            res.status(EServerResponseCodes.CREATED).json({
                rescode: EServerResponseRescodes.SUCCESS,
                message: "Fetched todo details successfully",
                data: {
                    todo: todo,
                },
            });
            return;
        } else {
            res.status(EServerResponseCodes.NOT_FOUND).json({
                rescode: EServerResponseRescodes.ERROR,
                message: "Todo not found",
                error: "Requested item does not exist",
            });
            return;
        }
    } catch (error) {
        console.error(error);
        res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to fetch the todo details",
            error: "Internal Server Error",
        });
        return;
    }
}

async function all(req: Request, res: Response) {
    logURL(req);

    const cursor = Number(req.query.cursor) || 0;
    const limit = Number(req.query.limit) || 10;

    try {
        const responseTodos = await TodoModel.find({}, null, {
            skip: cursor,
            limit,
        }); // pagination logic with skip and limit
        const todos = _.map(responseTodos, (todo) => {
            return TodoDetailsResponseSchema.parse(todo);
        });

        res.status(EServerResponseCodes.OK).json({
            rescode: EServerResponseRescodes.SUCCESS,
            message: "Todos fetched successfully",
            data: {
                todos: todos,
                cursor: todos.length ? cursor + todos.length : -1,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to fetch todos",
            error: "Internal Server Error",
        });
    }
}

async function edit(req: Request, res: Response) {
    const todoId = req.query.id as string; // taking id in query
    const changes = req.body?.changes as TEditTodoChangesSchema; // taking id in body, will require some extra work of processing the request.

    if (!todoId) {
        res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to create todo",
            error: "Bad request: ID is required",
        });
        return;
    }

    if (_.isEmpty(changes)) {
        res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to update todos",
            error: "Bad request: No changes sent to update",
        });
        return;
    }

    try {
        EditTodoChangesSchema.parse(changes);
    } catch (error) {
        res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to update the todo",
            error: "Bad request: Changes contain invalid fields",
        });
        return;
    }

    if (changes.isDone && changes.isDeleted) {
        res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to update todos",
            error: "Bad request: Invalid state transition, cannot mark isDone and isDeleted together",
        });
        return;
    }

    if (changes.isDone) {
        changes.reminder = null;
        changes.deadline = null;
        changes.completedOn = getCurrentTimeStamp();
    } else {
        changes.completedOn = null;
    }

    if (changes.isDeleted) {
        changes.deletedOn = getCurrentTimeStamp();
    } else {
        changes.deletedOn = null;
    }

    try {
        const updatedTodo = await TodoModel.findByIdAndUpdate(
            todoId,
            { $set: changes },
            { new: true }, // returns the updated todo otherwise old todo
        );
        if (_.isEmpty(updatedTodo)) {
            res.status(EServerResponseCodes.NOT_FOUND).json({
                rescode: EServerResponseRescodes.ERROR,
                message: "Unable to delete the todo",
                error: "Requested item does not exist",
            });
        } else {
            const todo = TodoDetailsResponseSchema.parse(updatedTodo);
            res.status(EServerResponseCodes.OK).json({
                rescode: EServerResponseRescodes.SUCCESS,
                message: "Todo updated successfully",
                data: {
                    todo: todo,
                },
            });
        }
    } catch (error) {
        console.error(error);
        res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to update the todo details",
            error: "Internal Server Error",
        });
    }
}

async function remove(req: Request, res: Response) {
    logURL(req);
    const todoId = req.query.id as string;

    if (!todoId) {
        res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to create todo",
            error: "Bad request: ID is required",
        });
        return;
    }

    try {
        const todo = await TodoModel.findByIdAndDelete(todoId);
        if (_.isEmpty(todo)) {
            res.status(EServerResponseCodes.NOT_FOUND).json({
                rescode: EServerResponseRescodes.ERROR,
                message: "Unable to delete the todo",
                error: "Requested item does not exist",
            });
        } else {
            res.status(EServerResponseCodes.OK).json({
                rescode: EServerResponseRescodes.SUCCESS,
                message: "Todo deleted successfully",
                data: {
                    id: todoId,
                },
            });
        }
    } catch (error) {
        console.error(error);
        res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to delete the todo",
            error: "Internal Server Error",
        });
    }
}

async function count(req: Request, res: Response) {
    logURL(req);

    try {
        const count = await TodoModel.countDocuments({ isDeleted: false });

        res.status(EServerResponseCodes.OK).json({
            rescode: EServerResponseRescodes.SUCCESS,
            message: "Todos fetched successfully",
            data: {
                count: count,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to fetch todos",
            error: "Internal Server Error",
        });
    }
}

const TodoController = {
    create,
    details,
    all,
    edit,
    remove,
    count,
};

export default TodoController;
