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

<template>
  <div class="min-h-screen flex flex-col">
    <HeaderComponent />
    <main class="flex-grow flex items-center">
      <div class="container mx-auto px-4">
        <div class="flex justify-center">
          <div class="w-full max-w-md">
            <div class="card">
              <div class="p-6">
                <h2 class="text-2xl font-bold text-center mb-6">
                  Iniciar Sesión
                </h2>
                <form @submit.prevent="handleLogin">
                  <div class="mb-6">
                    <div class="relative">
                      <input
                        type="email"
                        class="form-input peer"
                        id="email"
                        placeholder=" "
                        v-model="email"
                      />
                      <label
                        for="email"
                        class="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm"
                      >
                        Correo electrónico
                      </label>
                    </div>
                  </div>

                  <div class="mb-6">
                    <div class="relative">
                      <input
                        type="password"
                        class="form-input peer"
                        id="password"
                        placeholder=" "
                        v-model="password"
                      />
                      <label
                        for="password"
                        class="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm"
                      >
                        Contraseña
                      </label>
                    </div>
                  </div>

                  <button type="submit" class="boton w-full mb-2">
                    Iniciar Sesión
                  </button>
                </form>

                <div class="text-center mb-2">
                  <span class="text-gray-500">o</span>
                </div>

                <button
                  @click="handleGoogleLogin"
                  class="w-full flex items-center justify-center gap-2 py-2 px-8 rounded-full border-2 border-gray-800 text-gray-800 font-bold hover:bg-gray-50 transition-colors duration-300"
                >
                  <img
                    src="@/assets/icons/google.svg"
                    alt="Google"
                    class="w-5 h-5"
                  />
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
