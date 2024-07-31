import { z } from "zod";
import { TODO_PRIORITY } from "../constants/todos.consts";

export const CreateTodoRequestSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(60, "Title cannnot be more than 60 characters"),
});

export const EditTodoChangesSchema = CreateTodoRequestSchema.merge(
    z.object({
        description: z
            .string()
            .max(300, "Description cannot be more than 300 characters")
            .nullish(),

        priority: z.nativeEnum(TODO_PRIORITY).nullish(),

        isImportant: z.boolean().nullish(),
        isUrgent: z.boolean().nullish(),
        isDone: z.boolean().nullish(),
        isDeleted: z.boolean().nullish(),

        completedOn: z.number().nullish(),
        deletedOn: z.number().nullish(),

        deadline: z.number().nullish(),
        reminder: z.number().nullish(),
    }),
);

export const EditTodoRequestSchema = z.object({
    changes: EditTodoChangesSchema.omit({ deletedOn: true, completedOn: true }),
});

export type TCreateTodoRequestSchema = z.infer<typeof CreateTodoRequestSchema>;
export type TEditTodoChangesSchema = z.infer<typeof EditTodoChangesSchema>;
export type TEditTodoRequestSchema = z.infer<typeof EditTodoRequestSchema>;
