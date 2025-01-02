<script setup>
// Componentes Vue
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";

// Componentes UI
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

// Utilidades y Hooks
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useColorMode } from "@vueuse/core";
import { useAuthStore } from "../stores/auth";

// Recursos e iconos
import githubDark from "@/assets/icons/github-dark.svg";
import githubLight from "@/assets/icons/github-light.svg";

// Estado y referencias
const username = ref("");
const password = ref("");
const router = useRouter();
const mode = useColorMode();
const auth = useAuthStore();

// Computación de recursos
const githubIcon = computed(() =>
  mode.value === "light" ? githubLight : githubDark
);

// Manejadores de eventos (mocks de autenticación)
const handleLogin = () => {
  auth.login(username.value, password.value);
  router.push("/");
};
const handleSocialLogin = (_provider) => handleLogin();
</script>

<template>
  <section class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow flex items-center justify-center py-8 sm:py-12">
      <Card class="w-full max-w-md mx-4">
        <!-- Encabezado del Formulario -->
        <CardHeader class="space-y-1">
          <CardTitle class="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Introduce tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          <!-- Formulario de Credenciales -->
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div class="space-y-2">
              <Label for="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                autocomplete="username"
                v-model="username"
              />
            </div>
            <div class="space-y-2">
              <Label for="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autocomplete="current-password"
                v-model="password"
              />
            </div>
            <Button type="submit" class="w-full">Iniciar Sesión</Button>
          </form>

          <!-- Separador de Inicio de Sesión Social -->
          <section class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <hr class="w-full border-border" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="bg-background px-2 text-muted-foreground">
                O CONTINUA CON
              </span>
            </div>
          </section>

          <!-- Opciones de Inicio de Sesión Social -->
          <nav class="grid grid-cols-2 gap-4">
            <Button
              @click="handleSocialLogin('google')"
              variant="outline"
              class="hover:bg-muted/50"
            >
              <img
                src="@/assets/icons/google.svg"
                alt="Google"
                class="w-5 h-5 mr-2"
              />
              Google
            </Button>
            <Button
              @click="handleSocialLogin('github')"
              variant="outline"
              class="hover:bg-muted/50"
            >
              <img :src="githubIcon" alt="GitHub" class="w-5 h-5 mr-2" />
              GitHub
            </Button>
          </nav>
        </CardContent>
      </Card>
    </main>
    <Footer />
  </section>
</template>
