<script setup>
// Componentes UI
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Iconos y utilidades
import { Icon } from "@iconify/vue";
import { useColorMode } from "@vueuse/core";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Estado y referencias
const route = useRoute();
const router = useRouter();
const mode = useColorMode();
const auth = useAuthStore();

// Configuración de navegación
// Rutas principales (sin grupos)
const mainRoutes = router.options.routes
  .filter(
    (route) =>
      !route.redirect &&
      route.name &&
      !route.meta?.group &&
      !route.meta?.hideInNav
  )
  .map((route) => ({
    path: route.path,
    label:
      route.meta?.label ||
      route.name.charAt(0).toUpperCase() + route.name.slice(1),
  }));

// Rutas agrupadas
const groupedRoutes = router.options.routes.reduce((groups, route) => {
  if (route.meta?.group && !route.meta?.hideInNav) {
    const group = route.meta.group;
    if (!groups[group]) {
      groups[group] = {
        label:
          route.meta.groupLabel ||
          group.charAt(0).toUpperCase() + group.slice(1),
        routes: [],
      };
    }
    groups[group].routes.push({
      path: route.path,
      label: route.meta.label,
      description: route.meta.description,
    });
  }
  return groups;
}, {});
</script>

<template>
  <header
    class="sticky z-40 top-0 bg-background/80 backdrop-blur-lg border-b border-border"
  >
    <div class="container flex h-14 items-center justify-between">
      <!-- Navegación Principal -->
      <nav class="primary-navigation">
        <NavigationMenu>
          <NavigationMenuList>
            <!-- Rutas Principales -->
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

            <!-- Rutas Agrupadas -->
            <NavigationMenuItem
              v-for="(group, groupId) in groupedRoutes"
              :key="groupId"
            >
              <NavigationMenuTrigger
                :class="[
                  'text-foreground/60 hover:text-foreground/80',
                  route.path.startsWith(`/${groupId}`) && '!text-foreground',
                ]"
              >
                {{ group.label }}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul
                  class="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2"
                >
                  <li v-for="groupRoute in group.routes" :key="groupRoute.path">
                    <NavigationMenuLink asChild>
                      <router-link
                        :to="groupRoute.path"
                        class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <strong class="text-sm font-medium leading-none">
                          {{ groupRoute.label }}
                        </strong>
                        <p
                          v-if="groupRoute.description"
                          class="line-clamp-2 text-sm leading-snug text-muted-foreground"
                        >
                          {{ groupRoute.description }}
                        </p>
                      </router-link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>

      <!-- Menú de Acciones -->
      <nav class="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          @click="mode = mode === 'dark' ? 'light' : 'dark'"
          title="Cambiar Tema"
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

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" title="Usuario">
              <Icon icon="lucide:circle-user-round" class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56" align="end">
            <template v-if="auth.isAuthenticated">
              <DropdownMenuLabel class="font-normal">
                <div class="flex flex-col space-y-1">
                  <p class="text-sm font-medium leading-none">
                    {{ auth.userInfo.name || auth.userInfo.username }}
                  </p>
                  <p class="text-xs leading-none text-muted-foreground">
                    {{ auth.userInfo.email }}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                @click="auth.logout"
                class="cursor-pointer font-medium"
              >
                <div class="flex w-full items-center justify-between">
                  <span>Cerrar Sesión</span>
                  <Icon icon="lucide:log-out" class="h-4 w-4" />
                </div>
              </DropdownMenuItem>
            </template>
            <template v-else>
              <DropdownMenuItem
                @click="auth.login(route.path)"
                class="cursor-pointer font-medium"
              >
                <div class="flex w-full items-center justify-between">
                  <span>Iniciar Sesión</span>
                  <Icon icon="lucide:log-in" class="h-4 w-4" />
                </div>
              </DropdownMenuItem>
            </template>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </div>
  </header>
</template>
