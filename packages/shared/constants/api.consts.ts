export enum EServerResponseCodes {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,

    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,

    MOVED = 301,

    INTERNAL_SERVER_ERROR = 500,
}

export enum EServerResponseRescodes {
    SUCCESS = 0,
    ERROR = 1,
    QUEUED = 2,
}

export enum EMongooseError {
    UNKNOWN = 1,
    DUPLICATE = 11000,
}
