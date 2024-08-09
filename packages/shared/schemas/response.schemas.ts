import { z } from "zod";
import { EditTodoChangesSchema } from "./requests.schemas";

export const TodoDetailsResponseSchema = EditTodoChangesSchema.merge(
    z.object({
        id: z.string(),
        completedOn: z.number().nullish(),
        deletedOn: z.number().nullish(),
        updatedOn: z.number().nullish(),
        createdOn: z.number().nullish(),
    }),
);

export const CreateTodoResponseSchema = z.object({
    todo: TodoDetailsResponseSchema,
});

export const AllTodosResponseSchema = z.object({
    todos: z.array(TodoDetailsResponseSchema),
    cursor: z.number(),
});

export type TCreateTodoResponseSchema = z.infer<
    typeof CreateTodoResponseSchema
>;

export type TTodoDetailsResponseSchema = z.infer<
    typeof TodoDetailsResponseSchema
>;

export type TAllTodosResponseSchema = z.infer<typeof AllTodosResponseSchema>;

// Users and Auth
export const EditUserResponseSchema = z.object({
    name: z.string(),
    email: z.string(),
});

export type TEditUserResponseSchema = z.infer<typeof EditUserResponseSchema>;
