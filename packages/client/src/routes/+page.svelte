<script lang="ts">
    import { login, signup } from "../app/services/auth.service";

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
</script>

<svelte:head>
    <title>Svelte:Head</title>
    <meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
    <p>This is our main page</p>
    <button on:click={onSignup}>Sign Up</button>
    <button on:click={onLogin}>Login</button>
</section>
