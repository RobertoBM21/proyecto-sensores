<script setup>
// Layout components
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";

// UI components
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow flex items-center">
      <div class="container mx-auto px-4 py-8">
        <!-- Hero Section -->
        <div class="text-center mb-12">
          <h1 class="text-3xl font-bold text-foreground mb-6">Sensores</h1>
          <p class="text-muted-foreground max-w-2xl mx-auto">
            Bienvenido al sistema de gestión de sensores. Desde aquí podrás
            acceder a todas las funcionalidades del sistema.
          </p>
        </div>

        <!-- Cards Grid -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12"
        >
          <!-- Search Card -->
          <Card class="md:col-span-3 w-fit mx-auto">
            <CardHeader class="text-center">
              <CardTitle>Búsqueda de Sensores</CardTitle>
              <CardDescription>
                Accede a la información de los sensores registrados en el
                sistema
              </CardDescription>
            </CardHeader>
            <CardContent class="flex justify-center space-x-6">
              <Button asChild>
                <router-link to="/search/messages">Buscar Mensajes</router-link>
              </Button>
              <Button asChild>
                <router-link to="/search/devices"
                  >Buscar Dispositivos</router-link
                >
              </Button>
            </CardContent>
          </Card>

          <!-- Messages API Card -->
          <Card class="md:col-span-3 lg:col-span-1">
            <CardHeader>
              <CardTitle>Búsqueda de Mensajes</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-muted-foreground mb-4">
                El endpoint
                <code class="bg-muted text-foreground px-1 rounded"
                  >/messages/search</code
                >
                permite filtrar mensajes por:
              </p>
              <ul
                class="text-sm text-muted-foreground list-disc list-inside mb-4"
              >
                <li>Número de serie</li>
                <li>Servidor específico</li>
                <li>Rango de fechas personalizado</li>
                <li>Rangos predefinidos (última hora, día, etc.)</li>
              </ul>
            </CardContent>
          </Card>

          <!-- Activity Report Card -->
          <Card class="md:col-span-3 lg:col-span-1">
            <CardHeader>
              <CardTitle>Reporte de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-muted-foreground mb-4">
                El endpoint
                <code class="bg-muted text-foreground px-1 rounded"
                  >/devices/activity</code
                >
                proporciona informes detallados de:
              </p>
              <ul
                class="text-sm text-muted-foreground list-disc list-inside mb-4"
              >
                <li>Dispositivos activos por período</li>
                <li>Última comunicación</li>
                <li>Estadísticas por servidor</li>
                <li>Resumen de actividad</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>
