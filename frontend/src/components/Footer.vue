<script setup>
// Componentes UI
import { Button } from "@/components/ui/button";

// Utilidades y Hooks
import { useColorMode } from "@vueuse/core";
import { useConfigStore } from "@/stores/config";
import { computed } from "vue";

// Iconos
import githubDark from "@/assets/icons/github-dark.svg";
import githubLight from "@/assets/icons/github-light.svg";

// Estado y referencias
const mode = useColorMode();
const config = useConfigStore();

// Computación de recursos
const githubIcon = computed(() =>
  mode.value === "light" ? githubLight : githubDark
);

// Configuración de enlaces
const links = [
  { label: "Inicio", to: "/" },
  { label: "Mensajes", to: "/search/messages" },
  { label: "Dispositivos", to: "/search/devices" },
];

const resources = [
  {
    label: "Documentación API",
    href: config.getApiDocsUrl,
  },
  {
    label: "Guía de Uso",
    href: config.getRepoReadmeUrl,
  },
];

const contact = {
  email: "roberto.burruezom@gmail.com",
  github: "https://github.com/RobertoBM21",
};

const quickLinks = [
  {
    label: "Reportar Problema",
    href: config.getRepoIssuesUrl,
  },
  {
    label: "Repositorio",
    href: config.getRepoUrl,
  },
];
</script>

<template>
  <footer class="bg-card border-t">
    <!-- Contenido Principal -->
    <div class="container mx-auto px-4 sm:px-6 md:px-8 py-6">
      <div
        class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-4 text-center md:text-left"
      >
        <!-- Acerca de -->
        <div class="space-y-2 flex flex-col items-center md:items-start">
          <h3 class="font-semibold">Sistema de Sensores</h3>
          <p class="text-sm text-balance text-muted-foreground">
            Plataforma de monitorización y gestión de sensores IoT en tiempo
            real.
          </p>
          <div class="flex items-center gap-2 pt-1">
            <Button
              variant="ghost"
              size="icon"
              asChild
              class="hover:text-foreground"
            >
              <a
                :href="contact.github"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
              >
                <img :src="githubIcon" alt="GitHub" class="h-4 w-4" />
              </a>
            </Button>
            <a
              :href="`mailto:${contact.email}`"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {{ contact.email }}
            </a>
          </div>
        </div>

        <!-- Navegación -->
        <div class="space-y-2">
          <h3 class="font-semibold">Navegación</h3>
          <nav class="flex flex-col items-center md:items-start gap-1">
            <router-link
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {{ link.label }}
            </router-link>
          </nav>
        </div>

        <!-- Recursos -->
        <div class="space-y-2">
          <h3 class="font-semibold">Recursos</h3>
          <nav class="flex flex-col items-center md:items-start gap-1">
            <a
              v-for="resource in resources"
              :key="resource.label"
              :href="resource.href"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {{ resource.label }}
            </a>
          </nav>
        </div>

        <!-- Enlaces Rápidos -->
        <div class="space-y-2">
          <h3 class="font-semibold">Enlaces Rápidos</h3>
          <nav class="flex flex-col items-center md:items-start gap-1">
            <a
              v-for="link in quickLinks"
              :key="link.label"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {{ link.label }}
            </a>
          </nav>
        </div>
      </div>

      <!-- Barra Inferior -->
      <div class="pt-6 mt-6 border-t text-center">
        <p class="text-sm text-muted-foreground">
          © {{ new Date().getFullYear() }} Sistema de Sensores. Todos los
          derechos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>
