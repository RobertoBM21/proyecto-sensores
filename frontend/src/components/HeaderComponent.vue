<template>
  <header class="bg-gray-50 border-b-2 border-primary">
    <div class="px-4 py-2 flex justify-between items-center">
      <div class="flex items-center">
        <router-link to="/">
          <img src="@/assets/logo.png" alt="OdinS" class="w-1/5" />
        </router-link>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "HeaderComponent",
};
</script>
