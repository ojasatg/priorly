import { useCreateService } from "$lib/hooks/service.hooks";
import { EAPIRequestMethod } from "$lib/constants/api.consts";
import type { IPostAPIParams } from "$lib/types/api.types";

import APIs from "$constants/api.consts";

import {
    AllTodosRequestSchema,
    AllTodosResponseSchema,
    type TAllTodosRequestSchema,
    type TAllTodosResponseSchema,
} from "shared";

const todoService = useCreateService();

export function getAllTodos({ showAlerts, requestData }: IPostAPIParams<TAllTodosRequestSchema>) {
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
