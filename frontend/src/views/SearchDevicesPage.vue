<script setup>
// Layout components
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import DeviceSearchBar from "../components/DeviceSearchBar.vue";
import DevicesList from "../components/DevicesList.vue";

// Utilities
import { ref } from "vue";

const searchBarRef = ref(null);
const handleSearch = () => searchBarRef.value?.searchDevices();
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow">
      <div class="container mx-auto px-4 py-4 space-y-8">
        <DeviceSearchBar ref="searchBarRef" />
        <DevicesList @page-change="handleSearch" />
      </div>
    </main>
    <Footer />
  </div>
</template>
