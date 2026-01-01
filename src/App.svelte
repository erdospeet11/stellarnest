<script lang="ts">
  import Sidebar from "./lib/Sidebar.svelte";
  import Header from "./lib/Header.svelte";
  import Canvas from "./lib/Canvas.svelte";
</script>

<main class="app">
  <Sidebar />
  <div class="main-content">
    <Header />
    <div class="canvas-wrapper">
      <Canvas />
    </div>
  </div>
</main>

<style>
  .app {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  .main-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
  }

  .canvas-wrapper {
    flex: 1;
    position: relative;
    background: var(--bg-color);
    margin-top: var(--header-height);
    height: calc(100vh - var(--header-height));
  }
</style>
