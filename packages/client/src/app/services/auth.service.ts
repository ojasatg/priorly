import {
    CreateUserRequestSchema,
    CreateUserResponseSchema,
    LoginUserRequestSchema,
    LoginUserResponseSchema,
    type TCreateUserRequestSchema,
    type TLoginUserRequestSchema,
} from "shared";

import { useCreateService } from "$lib/hooks/service.hooks";
import type { IPostAPIParams } from "$lib/types/api.types";
import { EAPIRequestMethod } from "$lib/constants/api.consts";

import APIs from "$constants/api.consts";

const authService = useCreateService();

export function signup({ showAlerts, requestData }: IPostAPIParams<TCreateUserRequestSchema>) {
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

export function login({ showAlerts, requestData }: IPostAPIParams<TLoginUserRequestSchema>) {
    return authService({
        url: APIs.USER_LOGIN,
        options: {
            method: EAPIRequestMethod.POST,
            body: requestData,
        },
        requestSchema: LoginUserRequestSchema,
        responseSchema: LoginUserResponseSchema,
        showAlerts,
    });
}
