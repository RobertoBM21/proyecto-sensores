<script setup>
// Layout components
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import MessageSearchBar from "../components/MessageSearchBar.vue";
import MessagesList from "../components/MessagesList.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow">
      <div class="container mx-auto px-4 py-4">
        <!-- Search Controls -->
        <MessageSearchBar ref="MessageSearchBar" />
        <!-- Results Table & List -->
        <div class="mt-8">
          <MessagesList
            @page-change="$refs.MessageSearchBar.searchMessages()"
          />
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>
