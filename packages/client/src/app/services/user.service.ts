import {
    CreateTodoResponseSchema,
    CreateUserRequestSchema,
    type TDeleteUserRequestSchema,
    type TDeleteUserResponseSchema,
} from "shared";

import { useCreateService } from "$lib/hooks/service.hooks";
import type { IPostAPIParams } from "$lib/types/api.types";
import { EAPIRequestMethod } from "$lib/constants/api.consts";

import APIs from "$constants/api.consts";

const userService = useCreateService();

function deleteUser({ showAlerts }: IPostAPIParams<TDeleteUserRequestSchema>) {
    return userService<TDeleteUserResponseSchema>({
        url: APIs.DELETE_USER,
        options: {
            method: EAPIRequestMethod.DELETE,
        },
        requestSchema: CreateUserRequestSchema,
        responseSchema: CreateTodoResponseSchema,
        showAlerts: showAlerts,
    });
}

const UserService = {
    deleteUser,
};

export default UserService;
