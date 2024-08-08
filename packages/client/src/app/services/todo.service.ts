import { useCreateService } from "$lib/hooks/service.hooks";
import { EAPIRequestMethod } from "$lib/constants/api.consts";
import type { IPostAPIParams } from "$lib/types/api.types";

import APIs from "$constants/api.consts";

import {
    AllTodosRequestSchema,
    AllTodosResponseSchema,
    CreateTodoRequestSchema,
    CreateTodoResponseSchema,
    type TCreateTodoResponseSchema,
    type TAllTodosRequestSchema,
    type TAllTodosResponseSchema,
    type TCreateTodoRequestSchema,
} from "shared";

const todoService = useCreateService();

function getAllTodos({ showAlerts, requestData }: IPostAPIParams<TAllTodosRequestSchema>) {
    return todoService<TAllTodosResponseSchema>({
        url: APIs.GET_ALL_TOODS,
        options: {
            method: EAPIRequestMethod.POST,
            body: requestData,
        },
        requestSchema: AllTodosRequestSchema,
        responseSchema: AllTodosResponseSchema,
        showAlerts: showAlerts,
    });
}

function createTodo({ showAlerts, requestData }: IPostAPIParams<TCreateTodoRequestSchema>) {
    return todoService<TCreateTodoResponseSchema>({
        url: APIs.CREATE_TODO,
        options: {
            method: EAPIRequestMethod.POST,
            body: requestData,
        },
        requestSchema: CreateTodoRequestSchema,
        responseSchema: CreateTodoResponseSchema,
        showAlerts: showAlerts,
    });
}

const TodoService = {
    getAllTodos,
    createTodo,
};

export default TodoService;
