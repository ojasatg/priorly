<script lang="ts">
    import { login, signup } from "$services/auth.service";
    import { getAllTodos } from "$services/todo.service";

    async function onSignup() {
        await signup({
            showAlerts: false,
            requestData: {
                name: "Ojaswi",
                email: "ojaswi@gmail.com",
                password: "Ojaswi825@",
                confirmPassword: "Ojaswi825@",
            },
        });
    }

    async function onLogin() {
        await login({
            showAlerts: false,
            requestData: {
                email: "ojaswi@gmail.com",
                password: "Ojaswi825@",
            },
        });
    }

    async function fetchAllTodos() {
        const response = await getAllTodos({ showAlerts: true, requestData: {} });
        console.log(response?.todos);
    }
</script>

<svelte:head>
    <title>Svelte:Head</title>
    <meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
    <p>This is our main page</p>
    <button on:click={onSignup}>Sign Up</button>
    <button on:click={onLogin}>Login</button>

    <br />
    <br />

    <button on:click={fetchAllTodos}>Fetch All Todos</button>
</section>
