<script lang="ts">
    import AuthService from "$services/auth.service";
    import TodoService from "$services/todo.service";
    import UserService from "$services/user.service";

    async function onSignup() {
        try {
            await AuthService.signup({
                showAlerts: false,
                requestData: {
                    name: "Ojaswi",
                    email: "ojaswi@gmail.com",
                    password: "Ojaswi825@",
                    confirmPassword: "Ojaswi825@",
                },
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function onLogin() {
        try {
            await AuthService.login({
                showAlerts: false,
                requestData: {
                    email: "ojaswi@gmail.com",
                    password: "Ojaswi825@",
                },
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function fetchAllTodos() {
        try {
            const response = await TodoService.getAllTodos({ showAlerts: true, requestData: {} });
            console.log(response?.todos);
        } catch (error) {
            console.error(error);
        }
    }

    async function onCreate() {
        try {
            const response = await TodoService.createTodo({
                showAlerts: true,
                requestData: {
                    title: "New todo with user",
                },
            });

            console.log("todo created: :", response);
        } catch (error) {
            console.error(error);
        }
    }

    async function onDeleteUser() {
        try {
            await UserService.deleteUser({
                showAlerts: true,
                requestData: {},
            });

            console.log("user deleted successfully");
        } catch (error) {
            console.error(error);
        }
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
    <button on:click={onCreate}>Create todo</button>

    <br />
    <br />

    <button on:click={onDeleteUser}>Delete User</button>
</section>
