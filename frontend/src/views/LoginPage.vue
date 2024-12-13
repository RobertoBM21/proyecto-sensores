<script setup>
// Layout components
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";

// UI components
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

// Utilities
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useColorMode } from "@vueuse/core";

// Icons
import githubDark from "@/assets/icons/github-dark.svg";
import githubLight from "@/assets/icons/github-light.svg";

// Estado del formulario
const username = ref("");
const password = ref("");
const router = useRouter();
const mode = useColorMode();

const githubIcon = computed(() =>
  mode.value === "light" ? githubLight : githubDark
);

// Mock de autenticación => será reemplazado por Keycloak
const handleLogin = () => router.push("/");
const handleSocialLogin = (_provider) => router.push("/");
</script>

<template>
  <section class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow flex items-center justify-center">
      <Card class="w-full max-w-md">
        <!-- Login Form Header -->
        <CardHeader>
          <CardTitle class="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Introduce tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          <!-- Credentials Form -->
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

          <!-- Social Login Separator -->
          <section class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <hr class="w-full border-border" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="bg-background px-2 text-muted-foreground">
                O CONTINUA CON
              </span>
            </div>
          </section>

          <!-- Social Login Options -->
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
