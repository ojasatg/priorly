<script lang="ts">
    import { signup } from "../app/services/auth.service";

    async function onSignup() {
        await signup({
            showAlerts: true,
            requestData: {
                name: "Ojaswi",
                email: "ojaswi@gmail.com",
                password: "Ojaswi825@",
                confirmPassword: "Ojaswi825@",
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
</section>
