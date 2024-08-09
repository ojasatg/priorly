import js from "@eslint/js";
import ts from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import prettier from "eslint-config-prettier";
import globals from "globals";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    js.configs.recommended,
    ...ts.configs.recommended,
    ...svelte.configs["flat/recommended"],
    prettier,
    ...svelte.configs["flat/prettier"],
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        files: ["**/*.svelte", "**/*.ts", "**/*.js"],
        languageOptions: {
            parserOptions: {
                parser: ts.parser,
            },
        },
        rules: {
            "prefer-const": [
                "error",
                {
                    destructuring: "any",
                    ignoreReadBeforeAssign: false,
                },
            ],
            curly: ["error", "all"],
            "no-console": ["error", { allow: ["warn", "error", "info"] }],
            "@typescript-eslint/no-unsafe-function-type": ["warn"],
        },
    },
    {
        ignores: ["build/", ".svelte-kit/", "dist/"],
    },
];
