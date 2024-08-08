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

export interface IPostAPIParams<TRequest, TQuery = undefined> {
    requestData: TRequest;
    queryParams?: TQuery;
    showAlerts?: boolean;
}

export interface IGetAPIParams<TQuery = undefined> {
    queryParams?: TQuery;
    showAlerts?: boolean;
}
