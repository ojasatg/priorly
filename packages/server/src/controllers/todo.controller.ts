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
    AllTodosRequestSchema,
    CountTodosRequestSchema,
} from "shared";

import { logURL } from "../utils/logger.utils";

import TodoModel from "../models/TodoModel";

async function create(req: Request, res: Response) {
    logURL(req);
    let reqTodo = req.body;

    if (_.isEmpty(reqTodo)) {
        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to create todo",
            error: "Bad request: Sufficient data not available",
        });
    }

    try {
        reqTodo = CreateTodoRequestSchema.parse(reqTodo);
    } catch (error) {
        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to create todo",
            error: "Bad request: Invalid data",
        });
    }

    try {
        const createdTodo = await TodoModel.create(reqTodo);
        const todo = CreateTodoResponseSchema.parse(createdTodo); // strips unnecessary keys

        return res.status(EServerResponseCodes.CREATED).json({
            rescode: EServerResponseRescodes.SUCCESS,
            message: "Todo created succesfully",
            data: {
                todo: todo,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to add todo",
            error: "Internal Server Error",
        });
    }
}

async function details(req: Request, res: Response) {
    logURL(req);
    const todoId = req.query.id;

    if (!isValidObjectId(todoId)) {
        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to fetch the todo details",
            error: "Bad request: Invalid id",
        });
    }

    try {
        const foundTodo = await TodoModel.findById(todoId);
        if (!_.isEmpty(foundTodo)) {
            const todo = TodoDetailsResponseSchema.parse(foundTodo);

            return res.status(EServerResponseCodes.OK).json({
                rescode: EServerResponseRescodes.SUCCESS,
                message: "Fetched todo details successfully",
                data: {
                    todo: todo,
                },
            });
        } else {
            return res.status(EServerResponseCodes.NOT_FOUND).json({
                rescode: EServerResponseRescodes.ERROR,
                message: "Todo not found",
                error: "Requested item does not exist",
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to fetch the todo details",
            error: "Internal Server Error",
        });
    }
}

async function all(req: Request, res: Response) {
    logURL(req);

    console.log("userid from middleware: ", req.body.userID);

    try {
        AllTodosRequestSchema.parse(req.body);
    } catch (error) {
        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to fetch todos",
            error: "Bad request: Request body contains invalid fields and/or values",
        });
    }

    const cursor = req.body.cursor ?? 0;
    const limit = req.body.limit ?? 10;
    const filters = req.body.filters ?? {};

    if (filters.isDeleted === null || filters.isDeleted === undefined) {
        filters.isDeleted = false;
    }

    try {
        const responseTodos = await TodoModel.find(filters, null, {
            skip: cursor,
            limit,
        }); // pagination logic with skip and limit
        const todos = _.map(responseTodos, (todo) => {
            return TodoDetailsResponseSchema.parse(todo);
        });

        return res.status(EServerResponseCodes.OK).json({
            rescode: EServerResponseRescodes.SUCCESS,
            message: "Todos fetched successfully",
            data: {
                todos: todos,
                cursor: todos.length ? cursor + todos.length : -1,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to fetch todos",
            error: "Internal Server Error",
        });
    }
}

async function edit(req: Request, res: Response) {
    logURL(req);
    const todoId = req.query.id as string; // taking id in query
    const changes = req.body?.changes as TEditTodoChangesSchema; // taking id in body, will require some extra work of processing the request.

    if (!todoId) {
        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to create todo",
            error: "Bad request: ID is required",
        });
    }

    if (_.isEmpty(changes)) {
        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to update todos",
            error: "Bad request: No changes sent to update",
        });
    }

    try {
        EditTodoChangesSchema.parse(changes);
    } catch (error) {
        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to update the todo",
            error: "Bad request: Changes contain invalid fields and/or values",
        });
    }

    if (
        (changes.isDone ||
            changes.isDone === false ||
            changes.isDeleted ||
            changes.isDeleted === false) &&
        _.values(changes).length > 1
    ) {
        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to update todos",
            error: "Bad request: Can not apply more changes when toggling deleted or done",
        });
    }

    const updates = _.cloneDeep(changes) as TEditTodoChangesSchema & {
        completedOn: number | null;
        deletedOn: number | null;
    };

    if (changes.isDone) {
        updates.reminder = null;
        updates.deadline = null;
        updates.completedOn = getCurrentTimeStamp();
    } else {
        updates.completedOn = null;
    }

    if (changes.isDeleted) {
        updates.deletedOn = getCurrentTimeStamp();
    } else {
        updates.deletedOn = null;
    }

    try {
        // if todo is deleted then forbid other changes other than recovery
        const todo = await TodoModel.findById(todoId);

        if (
            todo?.isDeleted &&
            changes.isDeleted &&
            _.values(changes).length > 1
        ) {
            return res.status(EServerResponseCodes.BAD_REQUEST).json({
                rescode: EServerResponseRescodes.ERROR,
                message: "Unable to update todos",
                error: "Bad request: Can not apply any change on deleted todo",
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to update the todo details",
            error: "Internal Server Error",
        });
    }

    try {
        const updatedTodo = await TodoModel.findByIdAndUpdate(
            todoId,
            { $set: updates },
            { new: true }, // returns the updated todo otherwise old todo
        );
        if (_.isEmpty(updatedTodo)) {
            return res.status(EServerResponseCodes.NOT_FOUND).json({
                rescode: EServerResponseRescodes.ERROR,
                message: "Unable to delete the todo",
                error: "Requested item does not exist",
            });
        } else {
            const todo = TodoDetailsResponseSchema.parse(updatedTodo);
            return res.status(EServerResponseCodes.OK).json({
                rescode: EServerResponseRescodes.SUCCESS,
                message: "Todo updated successfully",
                data: {
                    todo: todo,
                },
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
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
        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to create todo",
            error: "Bad request: ID is required",
        });
    }

    try {
        const todo = await TodoModel.findByIdAndDelete(todoId);
        if (_.isEmpty(todo)) {
            return res.status(EServerResponseCodes.NOT_FOUND).json({
                rescode: EServerResponseRescodes.ERROR,
                message: "Unable to delete the todo",
                error: "Requested item does not exist",
            });
        } else {
            return res.status(EServerResponseCodes.OK).json({
                rescode: EServerResponseRescodes.SUCCESS,
                message: "Todo deleted successfully",
                data: {
                    id: todoId,
                },
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to delete the todo",
            error: "Internal Server Error",
        });
    }
}

async function count(req: Request, res: Response) {
    logURL(req);

    try {
        CountTodosRequestSchema.parse(req.body);
    } catch (error) {
        return res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to fetch todos",
            error: "Bad request: Request body contains invalid fields",
        });
    }

    const filters = req.body.filters ?? {};
    if (filters.isDeleted === null || filters.isDeleted === undefined) {
        filters.isDeleted = false;
    }

    try {
        const count = await TodoModel.countDocuments(filters);

        return res.status(EServerResponseCodes.OK).json({
            rescode: EServerResponseRescodes.SUCCESS,
            message: "Todos fetched successfully",
            data: {
                count: count,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
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
