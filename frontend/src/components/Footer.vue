<script setup>
import { useColorMode } from "@vueuse/core";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-vue-next";

const mode = useColorMode();

const links = [
  { label: "Inicio", to: "/" },
  { label: "Mensajes", to: "/search/messages" },
  { label: "Dispositivos", to: "/search/devices" },
];

const resources = [
  { label: "Documentación API", href: "#" },
  { label: "Guía de Uso", href: "#" },
  { label: "Estado del Sistema", href: "#" },
];

const contact = {
  email: "roberto.burruezom@gmail.com",
  github: "https://github.com/RobertoBM21",
};
</script>

<template>
  <footer class="bg-card border-t">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <!-- About -->
        <div class="space-y-3">
          <h3 class="font-semibold">Sistema de Sensores</h3>
          <p class="text-sm text-muted-foreground">
            Plataforma de monitorización y gestión de sensores IoT en tiempo
            real.
          </p>
          <div class="flex items-center gap-2 pt-2">
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
                <Github class="h-4 w-4" />
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

        <!-- Navigation -->
        <div class="space-y-3">
          <h3 class="font-semibold">Navegación</h3>
          <nav class="flex flex-col gap-2">
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

        <!-- Resources -->
        <div class="space-y-3">
          <h3 class="font-semibold">Recursos</h3>
          <nav class="flex flex-col gap-2">
            <a
              v-for="resource in resources"
              :key="resource.label"
              :href="resource.href"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {{ resource.label }}
            </a>
          </nav>
        </div>

        <!-- Quick Links -->
        <div class="space-y-3">
          <h3 class="font-semibold">Enlaces Rápidos</h3>
          <nav class="flex flex-col gap-2">
            <a
              href="#"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Política de Privacidad
            </a>
            <a
              href="#"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Términos de Uso
            </a>
          </nav>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-8 mt-8 border-t text-center">
        <p class="text-sm text-muted-foreground">
          © {{ new Date().getFullYear() }} Sistema de Sensores. Todos los
          derechos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.sleep-animation {
  animation: sleep 2s ease-in-out infinite;
  display: inline-block;
  opacity: 0.7;
}

@keyframes sleep {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-5px) scale(1.1);
    opacity: 1;
  }
}
</style>
