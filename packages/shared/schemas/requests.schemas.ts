import { z } from "zod";
import { TODO_PRIORITY } from "../constants/todos.consts";

// Request todos
export const CreateTodoRequestSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(60, "Title cannnot be more than 60 characters"),
});

export const EditTodoChangesSchema = z
    .object({
        title: z
            .string()
            .min(1, "Title is required")
            .max(60, "Title cannnot be more than 60 characters")
            .nullish(),
        description: z
            .string()
            .max(300, "Description cannot be more than 300 characters")
            .nullish(),

        priority: z.nativeEnum(TODO_PRIORITY).nullish(),

        isImportant: z.boolean().nullish(),
        isUrgent: z.boolean().nullish(),
        isDone: z.boolean().nullish(),
        isDeleted: z.boolean().nullish(),

        deadline: z.number().nullish(),
        reminder: z.number().nullish(),
    })
    .strict();

export const EditTodoRequestSchema = z
    .object({
        changes: EditTodoChangesSchema,
    })
    .strict();

export const AllTodosFilterSchema = z
    .object({
        isUrgent: z.boolean().nullish(),
        isImportant: z.boolean().nullish(),
        isDeleted: z.boolean().nullish(),
        isDone: z.boolean().nullish(),
    })
    .strict();

export const AllTodosRequestSchema = z
    .object({
        cursor: z.number().nullish(),
        limit: z.number().nullish(),
        filters: AllTodosFilterSchema.nullish(),
    })
    .strict();

export const CountTodosRequestSchema = AllTodosRequestSchema.omit({
    cursor: true,
    limit: true,
}).strict();

export type TCreateTodoRequestSchema = z.infer<typeof CreateTodoRequestSchema>;
export type TEditTodoChangesSchema = z.infer<typeof EditTodoChangesSchema>;
export type TEditTodoRequestSchema = z.infer<typeof EditTodoRequestSchema>;
export type TAllTodosRequestSchema = z.infer<typeof AllTodosRequestSchema>;
export type TCountTodosRequestSchema = z.infer<typeof CountTodosRequestSchema>;
export type TAllTodosFilterSchema = z.infer<typeof AllTodosFilterSchema>;

const userEmailSchema = z
    .string({ required_error: "Email is required" })
    .max(100, "Email cannot be more than 100 characters long")
    .regex(/^[\w.]+@([\w-]+\.)+[\w-]{2,4}$/g, "Please enter a valid email");

const userPasswordSchema = z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
    })
    .regex(/\d/, {
        message: "Password must contain at least one digit.",
    })
    .regex(/[!@#$%^&*()_\-+={}[\]|;:'",.<>?/~]/, {
        message: "Password must contain at least one special character.",
    });

const userNameSchema = z
    .string()
    .max(40, "Name cannot be more that 40 characters long")
    .nullish();

// Request Users
export const CreateUserRequestSchema = z
    .object({
        name: userNameSchema,
        email: userEmailSchema,
        password: userPasswordSchema,
        confirmPassword: z.string({
            required_error: "Confirm password is required",
        }), // making this string instead of userPasswordSchema ensures that we get "Passwords do not match" error as the first element of the errors array
    })
    .strict()
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const EditUserRequestSchema = z.object({
    changes: z.object({
        email: userEmailSchema.nullish(),
        name: userNameSchema.nullish(),
    }),
});

export type TCreateUserRequestSchema = z.infer<typeof CreateUserRequestSchema>;
export type TEditUserRequestSchema = z.infer<typeof EditUserRequestSchema>;
