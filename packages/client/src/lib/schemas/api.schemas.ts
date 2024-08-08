import { z } from "zod";
import { EServerResponseRescodes } from "shared";

export const SuccessResponseSchema = z.object({
    rescode: z.nativeEnum(EServerResponseRescodes),
    message: z.string(),
});

export const ErrorResponseSchema = z.object({
    rescode: z.nativeEnum(EServerResponseRescodes),
    message: z.string(),
    error: z.string(),
});

export type TSuccessResponseSchema = z.infer<typeof SuccessResponseSchema>;
export type TErrorResponseSchema = z.infer<typeof ErrorResponseSchema>;
