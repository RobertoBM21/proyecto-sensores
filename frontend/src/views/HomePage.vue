<script>
import HeaderComponent from "../components/HeaderComponent.vue";
import FooterComponent from "../components/FooterComponent.vue";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default {
  name: "HomePage",
  components: {
    HeaderComponent,
    FooterComponent,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    Button,
  },
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <HeaderComponent />
    <main class="flex-grow flex items-center">
      <div class="container mx-auto px-4 py-8">
        <div class="text-center mb-12">
          <h1 class="text-3xl font-bold mb-6">Sensores OdinS</h1>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Bienvenido al sistema de gestión de sensores OdinS. Desde aquí
            podrás acceder a todas las funcionalidades del sistema.
          </p>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12"
        >
          <Card class="md:col-span-3 w-fit mx-auto">
            <CardHeader class="text-center">
              <CardTitle>Búsqueda de Sensores</CardTitle>
              <CardDescription>
                Accede a la información de los sensores OdinS
              </CardDescription>
            </CardHeader>
            <CardContent class="flex justify-center">
              <Button asChild>
                <router-link to="/search">Ir a búsqueda</router-link>
              </Button>
            </CardContent>
          </Card>

          <Card class="md:col-span-3 lg:col-span-1">
            <CardHeader>
              <CardTitle>Búsqueda de Mensajes</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-muted-foreground mb-4">
                El endpoint
                <code class="bg-muted px-1 rounded">/messages/search</code>
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

          <Card class="md:col-span-3 lg:col-span-1">
            <CardHeader>
              <CardTitle>Reporte de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-muted-foreground mb-4">
                El endpoint
                <code class="bg-muted px-1 rounded">/devices/activity</code>
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
    <FooterComponent />
  </div>
</template>
