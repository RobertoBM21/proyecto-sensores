<script setup>
// Layout components
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import SearchBar from "../components/SearchBar.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow flex items-center justify-center">
      <div class="text-center">
        <h1
          class="text-6xl font-bold text-amber-700 hover:text-amber-600 transition-colors duration-300 cursor-pointer"
        >
          Patata
        </h1>
        <div class="text-8xl mt-12 animate-bounce">🥔</div>
      </div>
    </main>
    <Footer />
  </div>
</template>
