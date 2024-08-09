import { EServerResponseRescodes } from "shared";

export type TAPIError = {
    rescode: EServerResponseRescodes.ERROR;
    message: string;
    error: string;
};

export type TAPISuccess<TData = undefined> = {
    rescode: EServerResponseRescodes.SUCCESS | EServerResponseRescodes.QUEUED;
    message: string;
    data?: TData;
};

export interface IPostAPIParams<TRequest = undefined, TQuery = undefined> {
    requestData?: TRequest | null;
    queryParams?: TQuery | null;
    showAlerts?: boolean;
}

export interface IGetAPIParams<TQuery = undefined> {
    queryParams?: TQuery | null;
    showAlerts?: boolean;
}
