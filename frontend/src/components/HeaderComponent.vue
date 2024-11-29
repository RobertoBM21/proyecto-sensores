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

const mode = useColorMode();
</script>

<template>
  <header
    class="sticky z-40 top-0 bg-background/80 backdrop-blur-lg border-b border-border"
  >
    <div class="container px-4 py-2 flex justify-between items-center">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <router-link
                to="/"
                class="font-medium px-4 py-2 hover:bg-accent hover:text-accent-foreground rounded-md"
              >
                Home
              </router-link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <router-link
                to="/search"
                class="font-medium px-4 py-2 hover:bg-accent hover:text-accent-foreground rounded-md"
              >
                Búsqueda
              </router-link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <router-link
                to="/login"
                class="font-medium px-4 py-2 hover:bg-accent hover:text-accent-foreground rounded-md"
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
          class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
        <Icon
          icon="radix-icons:moon"
          class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <span class="sr-only">Cambiar Tema</span>
      </Button>
    </div>
  </header>
</template>
