import { PUBLIC_API_URI } from "$env/static/public";

import defu from "defu";
import _ from "lodash";
import { type FetchOptions, ofetch } from "ofetch";
import { z, ZodSchema } from "zod";

import {
    EServiceMessageCodes,
    EAPIRequestMethod,
    SERVICE_MESSAGES,
} from "$lib/constants/api.consts";

import { EServerResponseCodes, EServerResponseRescodes } from "shared";

import {
    SuccessResponseSchema,
    ErrorResponseSchema,
} from "$lib/schemas/api.schemas";

import { alerts } from "$lib/stores/AlertStore";

import type { TAPISuccess } from "$lib/types/api.types";

// import { handleAuthenticationError } from "$handlers/auth.handler";

interface ICreateServiceParams {
    url: string;
    options: FetchOptions;
    querySchema?: ZodSchema;
    requestSchema: ZodSchema;
    responseSchema: ZodSchema;
    showAlerts?: boolean;
}

async function createService<TData>({
    url,
    options,
    querySchema,
    requestSchema,
    responseSchema,
    showAlerts,
}: ICreateServiceParams): Promise<TData | undefined> {
    if (!navigator.onLine) {
        throw new Error(SERVICE_MESSAGES[EServiceMessageCodes.NO_INTERNET]);
    }

    const baseURL = PUBLIC_API_URI;
    const defaults: FetchOptions = {
        baseURL,
        timeout: 60000,
        // headers: {
        //     "X-Instance-Id": id,
        // },
        async onResponseError({ response }) {
            const status = response.status;
            const _raw = response._data;

            switch (status) {
                case EServerResponseCodes.UNAUTHORIZED:
                    // handleAuthenticationError(...)
                    // if response has any error, show alert here, dont return anything
                    break;
                case EServerResponseCodes.INTERNAL_SERVER_ERROR:
                    alerts.error(
                        _raw.message ??
                            SERVICE_MESSAGES[
                                EServiceMessageCodes.INTERNAL_SERVER_ERROR
                            ],
                    );
                    break;
                case EServerResponseCodes.NOT_FOUND:
                    alerts.error(
                        _raw.message ??
                            SERVICE_MESSAGES[
                                EServiceMessageCodes.ITEM_NOT_EXISTS
                            ],
                    );
                    break;
                case EServerResponseCodes.BAD_REQUEST:
                    alerts.error(
                        _raw.message ??
                            SERVICE_MESSAGES[EServiceMessageCodes.BAD_REQUEST],
                    );
                    break;

                default:
                    alerts.error(
                        _raw.message ??
                            SERVICE_MESSAGES[
                                EServiceMessageCodes.UNKNOWN_ERROR
                            ],
                    );
            }
        },
    };

    let requestBody = options?.body;
    let queryParams = options?.query;

    if (!_.isEmpty(requestBody)) {
        try {
            const requestParse = requestSchema.parse(requestBody);
            requestBody = requestParse; // strips unwanted keys
            options.body = requestParse;
        } catch (error) {
            console.error(error);
            if (showAlerts) {
                alerts.error(
                    SERVICE_MESSAGES[
                        EServiceMessageCodes.REQUEST_VALIDATION_FAILED
                    ],
                );
            }
            throw new Error(EServiceMessageCodes.REQUEST_VALIDATION_FAILED);
        }
    }

    if (!_.isEmpty(queryParams)) {
        if (!querySchema) {
            throw new Error(EServiceMessageCodes.QUERY_WITHOUT_SCHEMA);
        } else {
            try {
                const queryParse = querySchema.parse(queryParams);
                queryParams = queryParse; // strips unwanted keys
                options.query = queryParse;
            } catch (error) {
                console.error(error);
                if (showAlerts) {
                    alerts.error(
                        SERVICE_MESSAGES[
                            EServiceMessageCodes.QUERY_VALIDATION_FAILED
                        ],
                    );
                }
                throw new Error(EServiceMessageCodes.QUERY_VALIDATION_FAILED);
            }
        }
    }

    const params = defu(options, defaults) as {
        method: EAPIRequestMethod;
        headers: HeadersInit;
        body: BodyInit;
    };

    const response = (await ofetch(url, params)) as TAPISuccess<TData>;

    // If response is empty, throw error
    if (_.isEmpty(response)) {
        throw new Error(EServiceMessageCodes.EMPTY_RESPONSE);
    }

    if (
        response.rescode === EServerResponseRescodes.SUCCESS ||
        response.rescode === EServerResponseRescodes.QUEUED
    ) {
        // if api response is success, then merge the response schema with api success schema and try to validate
        const responseValidationSchema = SuccessResponseSchema.merge(
            z.object({ data: responseSchema }),
        );
        try {
            // try to validate the repsonse
            const responseResult = responseValidationSchema.parse(response);
            if (showAlerts) {
                alerts.success(response.message);
            }
            return responseResult.data as TData;
        } catch (error) {
            // throw error when validation fails
            console.error(error);
            if (showAlerts) {
                alerts.error(
                    SERVICE_MESSAGES[
                        EServiceMessageCodes.RESPONSE_VALIDATION_FAILED
                    ],
                );
            }
            throw new Error(EServiceMessageCodes.RESPONSE_VALIDATION_FAILED);
        }
    } else {
        // if api response is error
        const errorParse = ErrorResponseSchema.safeParse(response);

        if (errorParse.success) {
            // if error parsed successfully then we show error received by the server and throw error for the caller
            if (showAlerts) {
                alerts.error(errorParse.data.message as string);
            }
            console.error(errorParse.data.error);
            throw new Error(errorParse.data.error as string);
        } else {
            // else we show a predifined message and throw error for the caller.
            if (showAlerts) {
                alerts.error(
                    SERVICE_MESSAGES[
                        EServiceMessageCodes.ERROR_VALIDATION_FAILED
                    ],
                );
            }
            console.error(EServiceMessageCodes.ERROR_VALIDATION_FAILED);
            throw new Error(EServiceMessageCodes.ERROR_VALIDATION_FAILED);
        }
    }
}

export function useCreateService() {
    return createService;
}
