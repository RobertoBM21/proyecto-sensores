<script setup>
// UI components
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";

// Icons
import { Icon } from "@iconify/vue";

// Utilities
import { useColorMode } from "@vueuse/core";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const mode = useColorMode();

// Obtenemos las rutas de navegación del router
const navigationLinks = router.options.routes
  .filter((route) => !route.redirect && route.name) // Excluimos rutas de redirección y sin nombre
  .reduce((acc, route) => {
    if (route.path.startsWith("/search")) {
      if (!acc.find((r) => r.label === "Búsqueda")) {
        acc.push({
          label: "Búsqueda",
          isDropdown: true,
          children: [],
        });
      }
      acc
        .find((r) => r.label === "Búsqueda")
        .children.push({
          path: route.path,
          label: route.meta?.subLabel,
        });
    } else {
      acc.push({
        path: route.path,
        label:
          route.meta?.label ||
          route.name.charAt(0).toUpperCase() + route.name.slice(1), // Si no hay label, usamos el nombre de la ruta
      });
    }
    return acc;
  }, []);
</script>

<template>
  <header
    class="sticky z-40 top-0 bg-background/80 backdrop-blur-lg border-b border-border"
  >
    <div class="container px-4 py-2 flex justify-between items-center">
      <!-- Navigation Links -->
      <NavigationMenu>
        <NavigationMenuList class="flex items-center space-x-6 font-medium">
          <NavigationMenuItem v-for="link in navigationLinks" :key="link.label">
            <template v-if="link.isDropdown">
              <NavigationMenuTrigger>{{ link.label }}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul class="grid w-[200px] gap-3 p-4">
                  <li v-for="child in link.children" :key="child.path">
                    <NavigationMenuLink asChild>
                      <router-link
                        :to="child.path"
                        class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div class="text-sm font-medium leading-none">
                          {{ child.label }}
                        </div>
                      </router-link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </template>
            <template v-else>
              <NavigationMenuLink asChild>
                <router-link
                  :to="link.path"
                  :class="[
                    'transition-colors hover:text-foreground/80 text-foreground/60',
                    route.path === link.path &&
                      'font-semibold !text-foreground',
                  ]"
                >
                  {{ link.label }}
                </router-link>
              </NavigationMenuLink>
            </template>
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
