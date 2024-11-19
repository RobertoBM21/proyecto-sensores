<script>
import HeaderComponent from "../components/HeaderComponent.vue";
import FooterComponent from "../components/FooterComponent.vue";

export default {
  name: "HomePage",
  components: {
    HeaderComponent,
    FooterComponent,
  },
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <HeaderComponent />
    <main class="flex-grow flex items-center">
      <div class="container mx-auto px-4 py-8">
        <div class="text-center mb-12">
          <h1 class="text-3xl font-bold mb-6">Panel de Control</h1>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Bienvenido al sistema de gestión de sensores OdinS. Desde aquí
            podrás acceder a todas las funcionalidades del sistema.
          </p>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12"
        >
          <div class="card p-6 md:col-span-3">
            <h2 class="text-xl font-bold mb-4">Búsqueda de Sensores</h2>
            <p class="text-gray-600 mb-4">
              Accede a la información de los sensores OdinS
            </p>
            <router-link to="/search" class="boton inline-block"
              >Ir a búsqueda</router-link
            >
          </div>

          <div
            class="card p-6 md:col-span-3 lg:col-span-1 lg:col-start-1 lg:col-end-2"
          >
            <h2 class="text-lg font-bold mb-3">Búsqueda de Mensajes</h2>
            <p class="text-gray-600 mb-4 text-sm">
              El endpoint
              <code class="bg-gray-100 px-1 rounded">/messages/search</code>
              permite filtrar mensajes por:
            </p>
            <ul class="text-sm text-gray-600 list-disc list-inside mb-4">
              <li>Número de serie</li>
              <li>Servidor específico</li>
              <li>Rango de fechas personalizado</li>
              <li>Rangos predefinidos (última hora, día, etc.)</li>
            </ul>
          </div>

          <div
            class="card p-6 md:col-span-3 lg:col-span-1 lg:col-start-2 lg:col-end-3"
          >
            <h2 class="text-lg font-bold mb-3">Reporte de Actividad</h2>
            <p class="text-gray-600 mb-4 text-sm">
              El endpoint
              <code class="bg-gray-100 px-1 rounded">/devices/activity</code>
              proporciona informes detallados de:
            </p>
            <ul class="text-sm text-gray-600 list-disc list-inside mb-4">
              <li>Dispositivos activos por período</li>
              <li>Última comunicación</li>
              <li>Estadísticas por servidor</li>
              <li>Resumen de actividad</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
    <FooterComponent />
  </div>
</template>
