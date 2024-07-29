import { z } from "zod";
import { CreateTodoRequestSchema } from "./requests.schemas";
import { TODO_PRIORITY } from "../constants/todos.consts";

export const CreateTodoResponseSchema = CreateTodoRequestSchema.merge(
    z.object({
        id: z.string(),
    }),
);

export const TodoDetailsResponseSchema = CreateTodoResponseSchema.merge(
    z.object({
        description: z
            .string()
            .max(300, "Description cannot be more than 300 characters")
            .nullish(),

        priority: z.nativeEnum(TODO_PRIORITY).nullish(),

        isImportant: z.boolean().nullish(),
        isUrgent: z.boolean().nullish(),

        deadline: z.number().nullish(),
        reminder: z.number().nullish(),
    }),
);

export type TCreateTodoResponseSchema = z.infer<
    typeof CreateTodoResponseSchema
>;

export type TTodoDetailsResponseSchema = z.infer<
    typeof TodoDetailsResponseSchema
>;
