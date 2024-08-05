import _ from "lodash";
import type { ZodError } from "zod";
import {
    EMongooseError,
    EServerResponseCodes,
    type TMongooseError,
} from "shared";

export function getFormattedZodErrors(error: ZodError) {
    const init = {} as Record<string, string>;

    const errors = _.reduce(
        error.errors,
        (allErrors, e) => {
            const errorPath = e.path[0];
            allErrors[errorPath] = e.message;
            return allErrors;
        },
        init,
    );

    return errors;
}

export function getFormattedMongooseErrors(error: TMongooseError) {
    const errors = {} as Record<string, EMongooseError>;

    // extracting the field which has erros
    const field = Object.keys(error.keyPattern)[0] || "unknown";
    errors[field] = error.code;

    let statusCode = EServerResponseCodes.INTERNAL_SERVER_ERROR;

    // setting the response status code
    switch (error.code) {
        case EMongooseError.DUPLICATE:
            statusCode = EServerResponseCodes.CONFLICT;
            break;
    }

    return { code: statusCode, errors };
}
