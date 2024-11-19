<template>
  <header class="bg-light py-0">
    <div
      class="container-fluid d-flex justify-content-between align-items-center px-5"
    >
      <div class="d-flex align-items-center">
        <router-link to="/">
          <img src="@/assets/logo.png" alt="OdinS" class="me-3" />
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
