import adapter from "svelte-adapter-bun";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(),

    kit: {
        // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://kit.svelte.dev/docs/adapters for more information about adapters.
        adapter: adapter(),

        env: {
            dir: "./",
        },

        alias: {
            $components: "./src/app/components",
            $schemas: "./src/app/schemas",
            $handlers: "./src/app/handlers",
            $constants: "./src/app/constants",
            $types: "./src/app/types",
            $services: "./src/app/services",
            $utils: "./src/app/utils",
        },
    },
};

export default config;
