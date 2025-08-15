<script>
  import "./../app.css";

  let { children } = $props();
</script>

<main class="flex min-w-screen min-h-screen bg-base-100">
  {@render children?.()}
</main>
