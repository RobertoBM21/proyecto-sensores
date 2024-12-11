<script setup>
// Layout components
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import MessageSearchBar from "../components/MessageSearchBar.vue";
import MessagesList from "../components/MessagesList.vue";
import MessagesChart from "../components/MessagesChart.vue";

// Utilities
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useMessagesStore } from "../stores/messages";

const searchBarRef = ref(null);
const messagesStore = useMessagesStore();
const route = useRoute();

// Event handlers
const handleSearch = () => searchBarRef.value?.searchMessagesOnly();

// Si venimos de una redirección con filtros aplicados, buscamos automáticamente
onMounted(() => {
  const { serial, startDate, endDate, dateRange, serverIds, autoSearch } =
    route.query;

  if (autoSearch === "true") {
    const filters = {
      ...(serial && { serial }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(dateRange && { dateRange }),
      ...(serverIds && { selectedServers: serverIds.split(",").map(Number) }),
    };

    messagesStore.updateFilters(filters);
    handleSearch();
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow">
      <div class="container mx-auto px-4 py-4 space-y-8">
        <MessageSearchBar ref="searchBarRef" />
        <MessagesChart />
        <MessagesList @page-change="handleSearch" />
      </div>
    </main>
    <Footer />
  </div>
</template>
