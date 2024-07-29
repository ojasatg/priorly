import { z } from "zod";
import {
    CreateTodoRequestSchema,
    EditTodoRequestSchema,
} from "./requests.schemas";

export const CreateTodoResponseSchema = CreateTodoRequestSchema.merge(
    z.object({
        id: z.string(),
    }),
);

export const TodoDetailsResponseSchema = CreateTodoResponseSchema.merge(
    EditTodoRequestSchema,
).merge(
    z.object({
        completedOn: z.number().nullish(),
        deletedOn: z.number().nullish(),
    }),
);

export type TCreateTodoResponseSchema = z.infer<
    typeof CreateTodoResponseSchema
>;

export type TTodoDetailsResponseSchema = z.infer<
    typeof TodoDetailsResponseSchema
>;
