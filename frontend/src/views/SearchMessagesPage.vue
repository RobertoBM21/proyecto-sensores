<script setup>
// Componentes Vue
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import MessageSearchBar from "../components/MessageSearchBar.vue";
import MessagesList from "../components/MessagesList.vue";
import MessagesChart from "../components/MessagesChart.vue";

// Utilidades y Hooks
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useMessagesStore } from "../stores/messages";

// Estado y Referencias
const searchBarRef = ref(null);
const messagesStore = useMessagesStore();
const route = useRoute();

// Manejadores de eventos
const handleSearch = () => searchBarRef.value?.searchMessagesOnly();
const handleAutoSearch = () => searchBarRef.value?.searchMessages();

// Propiedades computadas
const initialSearchValues = computed(() => {
  if (!messagesStore.filters.isRedirected) return {};

  const { serial, startDate, endDate, dateRange, serverIds } = route.query;
  return {
    serial: serial || "",
    startDate,
    endDate,
    dateRange,
    selectedServers: serverIds ? serverIds.split(",").map(Number) : [],
  };
});

// Inicialización y carga de datos, si es una redirección se busca automáticamente
onMounted(() => {
  if (!messagesStore.filters.isRedirected) return;

  const { serial, startDate, endDate, dateRange, serverIds } = route.query;
  messagesStore.resetFilters();

  const filters = {
    ...(serial && { serial }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(dateRange && { dateRange }),
    ...(serverIds && { selectedServers: serverIds.split(",").map(Number) }),
  };

  messagesStore.updateFilters(filters);
  handleAutoSearch();
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow">
      <!-- Sección de Búsqueda y Resultados -->
      <div class="container mx-auto px-4 py-4 space-y-8">
        <MessageSearchBar
          ref="searchBarRef"
          :initial-values="initialSearchValues"
        />
        <MessagesChart />
        <MessagesList @page-change="handleSearch" />
      </div>
    </main>
    <Footer />
  </div>
</template>
