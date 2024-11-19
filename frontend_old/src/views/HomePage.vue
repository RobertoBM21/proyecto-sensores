<template>
  <div class="home min-vh-100 d-flex flex-column">
    <HeaderComponent />
    <main class="flex-grow-1 d-flex align-items-center">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-4">
            <div class="card shadow-sm">
              <div class="card-body p-4">
                <h2 class="text-center mb-4">Iniciar Sesión</h2>
                <form @submit.prevent="handleLogin">
                  <div class="form-floating mb-3">
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      placeholder="nombre@ejemplo.com"
                      v-model="email"
                    />
                    <label for="email">Correo electrónico</label>
                  </div>
                  <div class="form-floating mb-4">
                    <input
                      type="password"
                      class="form-control"
                      id="password"
                      placeholder="Contraseña"
                      v-model="password"
                    />
                    <label for="password">Contraseña</label>
                  </div>
                  <button type="submit" class="boton w-100 mb-3">
                    Iniciar Sesión
                  </button>
                </form>
                <div class="text-center my-3">
                  <span class="text-muted">o</span>
                </div>
                <button
                  @click="handleGoogleLogin"
                  class="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2"
                >
                  <i class="bi bi-google"></i>
                  Continuar con Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <FooterComponent />
  </div>
</template>

<script>
import HeaderComponent from "../components/HeaderComponent.vue";
import FooterComponent from "../components/FooterComponent.vue";

export default {
  name: "HomePage",
  components: {
    HeaderComponent,
    FooterComponent,
  },
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    handleLogin() {
      // Mock login
      this.$router.push("/search");
    },
    handleGoogleLogin() {
      // Mock Google login
      this.$router.push("/search");
    },
  },
};
</script>

<style scoped>
.card {
  border-radius: 15px;
  border: none;
}

.btn-outline-dark {
  border-radius: 30px;
  padding: 8px 30px;
  transition: all 0.3s ease;
}

.btn-outline-dark:hover {
  background-color: #f8f9fa;
  color: #000;
}

.form-control {
  border-radius: 10px;
}

.form-control:focus {
  border-color: #92d050;
  box-shadow: 0 0 0 0.2rem rgba(146, 208, 80, 0.25);
}
</style>
