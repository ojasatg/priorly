import { z } from "zod";
import {
    CreateTodoRequestSchema,
    EditTodoChangesSchema,
} from "./requests.schemas";

export const CreateTodoResponseSchema = CreateTodoRequestSchema.merge(
    z.object({
        id: z.string(),
    }),
);

export const TodoDetailsResponseSchema = CreateTodoResponseSchema.merge(
    EditTodoChangesSchema,
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
