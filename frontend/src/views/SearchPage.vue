<script setup>
import HeaderComponent from "../components/HeaderComponent.vue";
import FooterComponent from "../components/FooterComponent.vue";
import SearchBarComponent from "../components/SearchBarComponent.vue";
import ResultsComponent from "../components/ResultsComponent.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <HeaderComponent />
    <main class="flex-grow">
      <div class="container mx-auto px-4 py-4">
        <SearchBarComponent />
        <div class="mt-8">
          <ResultsComponent />
        </div>
      </div>
    </main>
    <FooterComponent />
  </div>
</template>
