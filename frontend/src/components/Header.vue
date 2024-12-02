<script setup>
// UI components
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

// Icons
import { Icon } from "@iconify/vue";

// Utilities
import { useColorMode } from "@vueuse/core";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const mode = useColorMode();

// Obtenemos las rutas directamente del router
const navigationLinks = router.options.routes
  .filter((route) => !route.redirect && route.name) // Excluimos redirecciones y rutas sin nombre
  .map((route) => ({
    path: route.path,
    label:
      route.meta?.label ||
      route.name.charAt(0).toUpperCase() + route.name.slice(1), // Si no hay label, usamos el nombre
  }));
</script>

<template>
  <header
    class="sticky z-40 top-0 bg-background/80 backdrop-blur-lg border-b border-border"
  >
    <div class="container px-4 py-2 flex justify-between items-center">
      <!-- Navigation Links -->
      <NavigationMenu>
        <NavigationMenuList class="flex items-center space-x-6 font-medium">
          <NavigationMenuItem v-for="link in navigationLinks" :key="link.path">
            <NavigationMenuLink asChild>
              <router-link
                :to="link.path"
                :class="[
                  'transition-colors hover:text-foreground/80 text-foreground/60',
                  route.path === link.path && 'font-semibold !text-foreground',
                ]"
              >
                {{ link.label }}
              </router-link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <!-- Theme Toggle -->
      <Button
        variant="ghost"
        size="icon"
        @click="mode = mode === 'dark' ? 'light' : 'dark'"
      >
        <Icon
          icon="radix-icons:sun"
          class="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
        <Icon
          icon="radix-icons:moon"
          class="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <span class="sr-only">Cambiar Tema</span>
      </Button>
    </div>
  </header>
</template>
