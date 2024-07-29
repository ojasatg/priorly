import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import _ from "lodash";

import {
    EServerResponseRescodes,
    EServerResponseCodes,
    CreateTodoResponseSchema,
    CreateTodoRequestSchema,
    TodoDetailsResponseSchema,
    type TEditTodoRequestSchema,
    EditTodoRequestSchema,
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
    const todoID = req.query.id;

    if (!isValidObjectId(todoID)) {
        res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to fetch the todo details",
            error: "Bad request: Invalid id",
        });
        return;
    }

    try {
        const foundTodo = await TodoModel.findById(todoID);
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

    // const filters = req.query as Record<string, string>;
    // if (_.isEmpty(filters)) {
    //     // making sure that we automatically fetch not deleted todos when we don't pass any filter
    //     filters["isDeleted"] = "false";
    // }

    const cursor = Number(req.query.cursor) || 0;
    const limit = Number(req.query.limit) || 10;

    // building filter
    // const selector = getSelector(filters);

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
                cursor: todos.length || -1,
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
    const todoID = req.query.id as string; // taking id in query
    const changes = req.body.changes; // taking id in body, will require some extra work of processing the request.

    if (!todoID) {
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
        EditTodoRequestSchema.parse(changes);
    } catch (error) {
        res.status(EServerResponseCodes.BAD_REQUEST).json({
            rescode: EServerResponseRescodes.ERROR,
            message: "Unable to update todos",
            error: "Bad request: Changes contain invalid fields",
        });
        return;
    }
}

const TodoController = {
    create,
    details,
    all,
    edit,
};

export default TodoController;
