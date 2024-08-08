import { CreateUserResponseSchema } from "./../../../../shared/schemas/response.schemas";
import { CreateUserRequestSchema, type TCreateUserRequestSchema } from "shared";

import { useCreateService } from "$lib/hooks/service.hooks";
import type { IPostAPIParams } from "$lib/types/api.types";
import { EAPIRequestMethod } from "$lib/constants/api.consts";

import APIs from "$constants/api.consts";

const authService = useCreateService();

export function signup({
    showAlerts,
    requestData,
}: IPostAPIParams<TCreateUserRequestSchema>) {
    return authService({
        url: APIs.USER_SIGNUP,
        options: {
            method: EAPIRequestMethod.POST,
            body: requestData,
        },
        requestSchema: CreateUserRequestSchema,
        responseSchema: CreateUserResponseSchema,
        showAlerts: showAlerts,
    });
}
