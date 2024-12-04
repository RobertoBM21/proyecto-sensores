<script setup>
import { computed, ref, watch, onMounted, defineComponent } from "vue";
import { Bar } from "vue-chartjs";
import { useMessagesStore } from "../stores/messages";
import { useColorMode } from "@vueuse/core";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const mode = useColorMode();
const store = useMessagesStore();

// Mover las opciones de agrupación aquí arriba
const groupingOptions = [
  { value: "hour", label: "1H", description: "Por hora" },
  { value: "day", label: "1D", description: "Por día" },
  { value: "week", label: "1S", description: "Por semana" },
  { value: "month", label: "1M", description: "Por mes" },
  { value: "year", label: "1A", description: "Último año" },
  { value: "5year", label: "5A", description: "Últimos 5 años" },
];

const selectedGrouping = ref("hour");
const isLoading = ref(true);

// Get CSS variables for theming
const getCssVar = (variable) =>
  getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

// Computed para los colores del tema
const themeColors = computed(() => ({
  primary: `hsl(${getCssVar("--primary")})`,
  primaryHover: `hsl(${getCssVar("--primary")} / 0.8)`,
  popover: `hsl(${getCssVar("--popover")})`,
  popoverForeground: `hsl(${getCssVar("--popover-foreground")})`,
  muted: `hsl(${getCssVar("--muted-foreground")})`,
}));

// Dynamic chart options based on theme
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 750,
    easing: "easeInOutQuart",
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Distribución Temporal de Mensajes",
      color: `hsl(${getCssVar("--foreground")})`,
      font: {
        size: 18,
        weight: "500",
        family: "'Inter', sans-serif",
      },
      padding: 20,
    },
    tooltip: {
      backgroundColor: themeColors.value.popover,
      titleColor: themeColors.value.popoverForeground,
      bodyColor: themeColors.value.popoverForeground,
      padding: 12,
      cornerRadius: 6,
      titleFont: {
        size: 14,
        weight: "600",
        family: "'Inter', sans-serif",
      },
      bodyFont: {
        size: 13,
        family: "'Inter', sans-serif",
      },
      callbacks: {
        label: (context) => {
          const value = context.raw;
          return `${value.toLocaleString("es-ES")} mensaje${
            value !== 1 ? "s" : ""
          }`;
        },
        title: (context) => {
          return `${context[0].label}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      ticks: {
        color: `hsl(${getCssVar("--muted-foreground")})`,
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
      },
    },
    y: {
      grid: {
        color: `hsl(${getCssVar("--border")} / 0.3)`,
        drawTicks: false,
      },
      border: {
        display: false,
      },
      ticks: {
        color: `hsl(${getCssVar("--muted-foreground")})`,
        padding: 8,
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
        callback: (value) => value.toLocaleString("es-ES"),
      },
      beginAtZero: true,
    },
  },
}));

// Mover la referencia al inicio
const chartInstance = ref(null);

// Process data for the chart
const chartData = computed(() => {
  if (!store.results.length) return null;

  const now = new Date();
  let groupedData = {};

  // Función auxiliar para obtener la clave según la agrupación
  const getGroupKey = (date) => {
    switch (selectedGrouping.value) {
      case "hour":
        return date.getHours();
      case "day":
        return date.getDate();
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split("T")[0];
      case "month":
        return date.getMonth();
      case "year":
        return date.getMonth() + (date.getFullYear() - now.getFullYear()) * 12;
      case "5year":
        return date.getFullYear();
    }
  };

  // Inicializar datos según la agrupación seleccionada
  switch (selectedGrouping.value) {
    case "hour":
      for (let i = 0; i < 24; i++) {
        groupedData[i] = {
          count: 0,
          label: `${String(i).padStart(2, "0")}:00`,
        };
      }
      break;
    case "day":
      for (let i = 1; i <= 31; i++) {
        groupedData[i] = { count: 0, label: `Día ${i}` };
      }
      break;
    case "week":
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const key = date.toISOString().split("T")[0];
        groupedData[key] = {
          count: 0,
          label: date.toLocaleDateString("es-ES", { weekday: "long" }),
        };
      }
      break;
    case "month":
      for (let i = 0; i < 12; i++) {
        groupedData[i] = {
          count: 0,
          label: new Date(2024, i).toLocaleDateString("es-ES", {
            month: "long",
          }),
        };
      }
      break;
    case "year":
      const yearAgo = new Date(now);
      yearAgo.setFullYear(now.getFullYear() - 1);
      for (let i = 0; i < 12; i++) {
        const date = new Date(yearAgo);
        date.setMonth(yearAgo.getMonth() + i);
        const key =
          date.getMonth() + (date.getFullYear() - now.getFullYear()) * 12;
        groupedData[key] = {
          count: 0,
          label: date.toLocaleDateString("es-ES", {
            month: "short",
            year: "numeric",
          }),
        };
      }
      break;
    case "5year":
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        groupedData[year] = {
          count: 0,
          label: year.toString(),
        };
      }
      break;
  }

  // Agrupar mensajes
  store.results.forEach((message) => {
    const date = new Date(message.timestamp);
    const key = getGroupKey(date);
    if (groupedData[key]) {
      groupedData[key].count++;
    }
  });

  // Preparar datos para el gráfico
  const sortedData = Object.values(groupedData);

  return {
    labels: sortedData.map((d) => d.label),
    datasets: [
      {
        data: sortedData.map((d) => d.count),
        backgroundColor: themeColors.value.primary,
        hoverBackgroundColor: themeColors.value.primaryHover,
        borderRadius: 4,
      },
    ],
  };
});

// En lugar de usar JSX, definimos el skeleton como un componente normal de Vue
const SkeletonLoader = defineComponent({
  name: "SkeletonLoader",
  template: `
    <div class="animate-pulse">
      <div class="h-[300px] bg-muted rounded-lg"></div>
    </div>
  `,
});

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 1000);
});

// Simplificar el watch para forzar la actualización completa
watch(
  [mode, selectedGrouping],
  () => {
    ChartJS.defaults.color = themeColors.value.muted;
    if (chartInstance.value) {
      chartInstance.value.update();
    }
  },
  { immediate: true }
);

// Ya no necesitamos updateChartColors ni handleChartRender
const handleChartRender = (chart) => {
  chartInstance.value = chart;
};
</script>

<template>
  <div v-if="store.hasResults" class="w-full space-y-4">
    <!-- Card wrapper para la gráfica -->
    <div class="rounded-lg border bg-card p-4">
      <!-- Header con título y selector -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium">Mensajes en el tiempo</h3>
        <!-- Grupo de botones para la agrupación -->
        <div
          class="inline-flex items-center rounded-md border bg-muted p-1 text-muted-foreground"
        >
          <button
            v-for="option in groupingOptions"
            :key="option.value"
            @click="selectedGrouping = option.value"
            class="inline-flex items-center justify-center rounded-sm px-2.5 py-1.5 text-sm font-medium transition-colors hover:text-foreground"
            :class="{
              'bg-background text-foreground shadow-sm':
                selectedGrouping === option.value,
            }"
            :title="option.description"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Chart or Skeleton -->
      <div class="h-[300px]">
        <component :is="SkeletonLoader" v-if="isLoading" />
        <Bar
          v-else-if="chartData"
          :data="chartData"
          :options="chartOptions"
          @chart:render="handleChartRender"
        />
      </div>
    </div>
  </div>
</template>
