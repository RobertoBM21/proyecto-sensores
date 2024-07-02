<template>
  <header class="bg-light py-0">
    <div
      class="container-fluid d-flex justify-content-between align-items-center px-5"
    >
      <div class="d-flex align-items-center">
        <img src="@/assets/logo.png" alt="OdinS" class="me-3" />
      </div>
      <div>
        <button @click="login" id="loginButton" class="boton">Login</button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  methods: {
    login() {
      // Funcionalidad de login
    },
  },
};
</script>
