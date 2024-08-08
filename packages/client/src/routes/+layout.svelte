<script>
    import "../app.css";

    console.log("however")
</script>

<div class="app">
    <header>
        <p>This is App Header in layout</p>
    </header>

    <main>
        <slot />
    </main>

    <footer>
        <p>This is app footer in the layout</p>
    </footer>
</div>

<style scoped>
</style>
