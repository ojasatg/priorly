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

            res.status(EServerResponseCodes.OK).json({
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

    try {
        AllTodosRequestSchema.parse(req.body);
    } catch (error) {
        res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to fetch todos",
            error: "Bad request: Request body contains invalid fields and/or values",
        });
        return;
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
            error: "Bad request: Changes contain invalid fields and/or values",
        });
        return;
    }

    if (
        (changes.isDone ||
            changes.isDone === false ||
            changes.isDeleted ||
            changes.isDeleted === false) &&
        _.values(changes).length > 1
    ) {
        res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to update todos",
            error: "Bad request: Can not apply more changes when toggling deleted or done",
        });
        return;
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
            res.status(EServerResponseCodes.BAD_REQUEST).json({
                rescode: EServerResponseRescodes.ERROR,
                message: "Unable to update todos",
                error: "Bad request: Can not apply any change on deleted todo",
            });
            return;
        }
    } catch (error) {
        console.error(error);
        res.status(EServerResponseCodes.INTERNAL_SERVER_ERROR).json({
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
        CountTodosRequestSchema.parse(req.body);
    } catch (error) {
        res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to fetch todos",
            error: "Bad request: Request body contains invalid fields",
        });
        return;
    }

    const filters = req.body.filters ?? {};
    if (filters.isDeleted === null || filters.isDeleted === undefined) {
        filters.isDeleted = false;
    }

    try {
        const count = await TodoModel.countDocuments(filters);

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
