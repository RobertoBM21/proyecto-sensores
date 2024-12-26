<script setup>
// Componentes Vue
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";

// Componentes UI
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

// Utilidades y Hooks
import { useHomeStore } from "../stores/home";
import { computed, onMounted } from "vue";
import { Activity, Search, BarChart3, Cpu } from "lucide-vue-next";

// Inicialización del Store
const home = useHomeStore();

// Configuración y carga inicial
onMounted(async () => {
  await home.fetchAllStats();
});

// Configuración de estadísticas
const STATS_CONFIG = [
  {
    label: "Dispositivos Activos",
    value: (data) => {
      if (data?.errors?.activeDevices?.name === "NotFoundError") return 0;
      return data?.activeDevices;
    },
    icon: Cpu,
    description: "Sensores que han enviado datos en la última hora",
  },
  {
    label: "Mensajes Recibidos",
    value: (data) => {
      if (data?.errors?.recentMessages?.name === "NotFoundError") return 0;
      return data?.recentMessages;
    },
    icon: BarChart3,
    description: "Mensajes recibidos en las últimas 24 horas",
  },
  {
    label: "Cobertura Semanal",
    value: (data) => {
      if (data?.errors?.weeklyStats?.name === "NotFoundError") return "0%";
      if (!data?.weeklyStats?.totalDevices || !data?.weeklyStats?.totalItems)
        return undefined;
      return `${(
        (data.weeklyStats.totalItems / data.weeklyStats.totalDevices) *
        100
      ).toFixed(1)}%`;
    },
    icon: Activity,
    description: "Dispositivos activos en los últimos 7 días",
  },
];

// Computación de estadísticas
const stats = computed(() =>
  STATS_CONFIG.map((stat) => ({
    ...stat,
    value: stat.value(home) ?? "N/A",
  }))
);

// Estado de carga
const loading = computed(() => home.loading);
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow">
      <!-- Sección Principal (Hero) -->
      <section class="relative bg-background py-20">
        <div class="container px-4 sm:px-6 md:px-8 mx-auto">
          <div class="max-w-3xl mx-auto text-center">
            <h1
              class="text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
            >
              Sistema de Monitoreo de Sensores
            </h1>
            <p class="mt-6 text-lg text-muted-foreground text-balance">
              Plataforma centralizada para el seguimiento, análisis y gestión de
              datos de sensores en tiempo real.
            </p>
            <div class="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" asChild>
                <router-link to="/search/messages"
                  >Explorar Mensajes</router-link
                >
              </Button>
              <Button size="lg" variant="outline" asChild>
                <router-link to="/search/devices">Ver Dispositivos</router-link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <!-- Sección de Estadísticas -->
      <section class="py-12">
        <div class="container px-4 sm:px-6 md:px-8 mx-auto">
          <div class="grid md:grid-cols-3 gap-8">
            <Card
              v-for="stat in stats"
              :key="stat.label"
              class="transition-all hover:shadow-lg hover:shadow-foreground/5 hover:bg-muted/50"
            >
              <CardHeader
                class="flex flex-row items-center justify-between space-y-0 pb-2"
              >
                <CardTitle class="text-lg font-medium">
                  {{ stat.label }}
                </CardTitle>
                <component
                  :is="stat.icon"
                  class="h-5 w-5"
                  :class="{
                    'text-muted-foreground animate-pulse': loading,
                    'text-muted-foreground': !loading,
                  }"
                />
              </CardHeader>
              <CardContent>
                <div
                  class="text-3xl font-bold"
                  :class="{ 'animate-pulse': loading }"
                >
                  {{ stat.value }}
                </div>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ stat.description }}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <!-- Sección de Características -->
      <section class="py-16">
        <div class="container px-4 sm:px-6 md:px-8 mx-auto">
          <h2 class="text-3xl font-bold text-center mb-12">
            Características Principales
          </h2>
          <div class="grid md:grid-cols-2 gap-8">
            <div
              class="space-y-4 flex flex-col items-center text-center md:text-left md:items-start"
            >
              <Search class="h-8 w-8 text-primary" />
              <h3 class="text-xl font-semibold">Búsqueda Avanzada</h3>
              <p class="text-muted-foreground">
                Encuentra mensajes y dispositivos específicos utilizando filtros
                por número de serie, rango de fechas y servidor.
              </p>
            </div>
            <div
              class="space-y-4 flex flex-col items-center text-center md:text-left md:items-start"
            >
              <Activity class="h-8 w-8 text-primary" />
              <h3 class="text-xl font-semibold">Monitoreo en Tiempo Real</h3>
              <p class="text-muted-foreground">
                Visualiza la actividad de los sensores, estadísticas de mensajes
                y estado de los dispositivos en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
</template>
