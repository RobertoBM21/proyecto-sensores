<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";
import { useColorMode } from "@vueuse/core";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useRoute } from "vue-router";

const route = useRoute();
const mode = useColorMode();
</script>

<template>
  <header
    class="sticky z-40 top-0 bg-background/80 backdrop-blur-lg border-b border-border"
  >
    <div class="container px-4 py-2 flex justify-between items-center">
      <NavigationMenu>
        <NavigationMenuList class="flex items-center space-x-6 font-medium">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <router-link
                to="/"
                :class="[
                  'transition-colors hover:text-foreground/80 text-foreground/60',
                  route.path === '/' && 'font-semibold !text-foreground',
                ]"
              >
                Home
              </router-link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <router-link
                to="/search"
                :class="[
                  'transition-colors hover:text-foreground/80 text-foreground/60',
                  route.path === '/search' && 'font-semibold !text-foreground',
                ]"
              >
                Búsqueda
              </router-link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <router-link
                to="/login"
                :class="[
                  'transition-colors hover:text-foreground/80 text-foreground/60',
                  route.path === '/login' && 'font-semibold !text-foreground',
                ]"
              >
                Login
              </router-link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
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
