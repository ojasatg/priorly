import { z } from "zod";

export const CreateTodoRequestSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(60, "Title cannnot be more than 60 characters"),
});

export type TCreateTodoRequestSchema = z.infer<typeof CreateTodoRequestSchema>;
