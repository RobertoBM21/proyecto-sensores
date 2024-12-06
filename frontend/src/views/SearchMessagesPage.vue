<script setup>
// Layout components
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import MessageSearchBar from "../components/MessageSearchBar.vue";
import MessagesList from "../components/MessagesList.vue";
import MessagesChart from "../components/MessagesChart.vue";

// Utilities
import { ref } from "vue";

const searchBarRef = ref(null);

const handlePageChange = () => {
  searchBarRef.value.searchMessagesOnly();
};

const handleLimitChange = () => {
  searchBarRef.value.searchMessagesOnly();
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow">
      <div class="container mx-auto px-4 py-4">
        <!-- Search Controls -->
        <MessageSearchBar ref="searchBarRef" />
        <!-- Chart -->
        <div class="mt-8">
          <MessagesChart />
        </div>
        <!-- Results Table & List -->
        <div class="mt-8">
          <MessagesList
            @page-change="handlePageChange"
            @limit-change="handleLimitChange"
          />
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>
