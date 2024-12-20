<script setup>
// Componentes Vue
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import DeviceSearchBar from "../components/DeviceSearchBar.vue";
import DevicesList from "../components/DevicesList.vue";

// Utilidades y Referencias
import { ref } from "vue";

// Referencias y manejadores
const searchBarRef = ref(null);
const handleSearch = () => searchBarRef.value?.searchDevices();
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow">
      <!-- Sección de Búsqueda -->
      <div class="container mx-auto px-4 py-4 space-y-8">
        <DeviceSearchBar ref="searchBarRef" />
        <DevicesList @page-change="handleSearch" />
      </div>
    </main>
    <Footer />
  </div>
</template>
