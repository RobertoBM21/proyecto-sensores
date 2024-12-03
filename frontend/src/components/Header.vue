<script setup>
// UI components
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

// Icons
import { Icon } from "@iconify/vue";

// Utilities
import { useColorMode } from "@vueuse/core";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const mode = useColorMode();

// Obtenemos las rutas principales y de búsqueda del router
const mainRoutes = router.options.routes
  .filter((route) => !route.redirect && route.name && !route.meta?.group)
  .map((route) => ({
    path: route.path,
    label:
      route.meta?.label ||
      route.name.charAt(0).toUpperCase() + route.name.slice(1),
  }));

const searchRoutes = router.options.routes
  .filter((route) => route.meta?.group === "search")
  .map((route) => ({
    path: route.path,
    label: route.meta?.subLabel,
    description: `Buscar ${route.meta?.subLabel.toLowerCase()}`,
  }));
</script>

<template>
  <header
    class="sticky z-40 top-0 bg-background/80 backdrop-blur-lg border-b border-border"
  >
    <div class="container flex h-14 items-center justify-between">
      <NavigationMenu>
        <NavigationMenuList>
          <!-- Main routes -->
          <NavigationMenuItem v-for="link in mainRoutes" :key="link.path">
            <NavigationMenuLink asChild>
              <router-link
                :to="link.path"
                :class="[
                  navigationMenuTriggerStyle(),
                  'text-foreground/60 hover:text-foreground/80',
                  route.path === link.path && '!text-foreground',
                ]"
              >
                {{ link.label }}
              </router-link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <!-- Search dropdown -->
          <NavigationMenuItem v-if="searchRoutes.length">
            <NavigationMenuTrigger
              :class="[
                'text-foreground/60 hover:text-foreground/80',
                route.path.startsWith('/search') && '!text-foreground',
              ]"
            >
              Búsqueda
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul class="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                <li v-for="searchRoute in searchRoutes" :key="searchRoute.path">
                  <NavigationMenuLink asChild>
                    <router-link
                      :to="searchRoute.path"
                      class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div class="text-sm font-medium leading-none">
                        {{ searchRoute.label }}
                      </div>
                      <p
                        class="line-clamp-2 text-sm leading-snug text-muted-foreground"
                      >
                        {{ searchRoute.description }}
                      </p>
                    </router-link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
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

<style scoped>
/* Eliminamos los estilos personalizados ya que usaremos los predeterminados */
</style>
