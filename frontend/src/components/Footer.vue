<script setup>
import { useColorMode } from "@vueuse/core";
const mode = useColorMode();
</script>

<template>
  <footer
    class="py-3 md:px-8 md:py-0 bg-background/80 backdrop-blur-sm border-t border-border"
  >
    <div
      class="container flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row"
    >
      <p
        class="text-muted-foreground text-center italic group text-xl md:text-2xl"
      >
        <span class="text-3xl md:text-4xl">🚧</span> Sitio en construcción...
        <span class="inline-block sleep-animation text-3xl md:text-4xl"
          >💤</span
        >
      </p>
    </div>
  </footer>
</template>

<style scoped>
.sleep-animation {
  animation: sleep 2s ease-in-out infinite;
  display: inline-block;
  opacity: 0.7;
}

@keyframes sleep {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-5px) scale(1.1);
    opacity: 1;
  }
}
</style>
