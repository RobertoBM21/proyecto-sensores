<script setup>
// Layout components
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import DeviceSearchBar from "../components/DeviceSearchBar.vue";
import DevicesList from "../components/DevicesList.vue";

// Utilities
import { ref } from "vue";

const searchBarRef = ref(null);

const handlePageChange = () => {
  searchBarRef.value.searchDevices();
};

const handleLimitChange = () => {
  searchBarRef.value.searchDevices();
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow">
      <div class="container mx-auto px-4 py-4">
        <!-- Search Controls -->
        <DeviceSearchBar ref="searchBarRef" />
        <!-- Results Table & List -->
        <div class="mt-8">
          <DevicesList
            @page-change="handlePageChange"
            @limit-change="handleLimitChange"
          />
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>
