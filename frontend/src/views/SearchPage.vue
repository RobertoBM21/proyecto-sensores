<script setup>
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import SearchBar from "../components/SearchBar.vue";
import ResultsComponent from "../components/ResultsComponent.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow">
      <div class="container mx-auto px-4 py-4">
        <SearchBar ref="searchBar" />
        <div class="mt-8">
          <ResultsComponent @page-change="$refs.searchBar.searchMessages()" />
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>
