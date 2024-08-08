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
        updatedOn: z.number().nullish(),
        createdOn: z.number().nullish(),
    }),
);

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

// Users

export const CreateUserResponseSchema = z.object({});

export const LoginUserResponseSchema = CreateUserResponseSchema;
export const EditUserResponseSchema = CreateUserResponseSchema;

export type TCreateUserResponseSchema = z.infer<
    typeof CreateUserResponseSchema
>;
export type TLoginUserResponseSchema = z.infer<typeof LoginUserResponseSchema>;
export type TEditUserResponseSchema = z.infer<typeof EditUserResponseSchema>;
