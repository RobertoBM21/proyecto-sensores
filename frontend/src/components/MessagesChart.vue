<script setup>
// Componentes UI
import { AreaChart } from "@/components/ui/chart-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Store
import { useMessagesStore } from "../stores/messages";

// Utilidades y Hooks
import { computed, ref } from "vue";
import { CurveType } from "@unovis/ts";

// Tipos y Constantes
const ChartRangeType = {
  HOUR: "hour",
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
  YEAR: "year",
  FIVE_YEAR: "5year",
};

// Configuración
const DATE_CONFIG = {
  formats: {
    DAYS_COMPLETE: [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ],
    DAYS_SHORT: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    MONTHS_COMPLETE: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    MONTHS_SHORT: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ],
  },
  timeRanges: [
    { id: ChartRangeType.HOUR, label: "1H", description: "Última hora" },
    { id: ChartRangeType.DAY, label: "1D", description: "Último día" },
    { id: ChartRangeType.WEEK, label: "1S", description: "Última semana" },
    { id: ChartRangeType.MONTH, label: "1M", description: "Último mes" },
    { id: ChartRangeType.YEAR, label: "1A", description: "Último año" },
    {
      id: ChartRangeType.FIVE_YEAR,
      label: "5A",
      description: "Últimos 5 años",
    },
  ],
};

// Estado y Referencias
const store = useMessagesStore();
const selectedRange = ref(ChartRangeType.HOUR);

// Estrategias de Rangos de Tiempo (Patrón de Diseño: Strategy)
const timeRangeStrategies = {
  [ChartRangeType.HOUR]: {
    getTimeLimit: (startDate) => new Date(startDate),
    initializeData: (startDate) => {
      const grouped = new Map();
      const hour = startDate.getHours();
      for (let minute = 0; minute < 60; minute++) {
        grouped.set(formatHourMinute(hour, minute), 0);
      }
      return grouped;
    },
    getKey: (date) => formatHourMinute(date.getHours(), date.getMinutes()),
    formatLabel: (timestamp) => {
      const [h, minute] = timestamp.split(":").map(Number);
      return minute % 10 === 0 ? timestamp : "";
    },
  },
  [ChartRangeType.DAY]: {
    getTimeLimit: (startDate) => new Date(startDate),
    initializeData: () => {
      const grouped = new Map();
      for (let hour = 0; hour <= 24; hour++) {
        grouped.set(formatHourMinute(hour, 0), 0);
      }
      return grouped;
    },
    getKey: (date) => formatHourMinute(date.getHours(), 0),
    formatLabel: (timestamp) => timestamp,
  },
  [ChartRangeType.WEEK]: {
    getTimeLimit: (startDate) => new Date(startDate),
    initializeData: () => {
      const grouped = new Map();
      DATE_CONFIG.formats.DAYS_COMPLETE.forEach((day) => grouped.set(day, 0));
      return grouped;
    },
    getKey: (date) =>
      DATE_CONFIG.formats.DAYS_COMPLETE[
        date.getDay() === 0 ? 6 : date.getDay() - 1
      ],
    formatLabel: (timestamp) => {
      const dayIndex = DATE_CONFIG.formats.DAYS_COMPLETE.indexOf(timestamp);
      return DATE_CONFIG.formats.DAYS_SHORT[dayIndex];
    },
  },
  [ChartRangeType.MONTH]: {
    getTimeLimit: (startDate) => new Date(startDate),
    initializeData: (startDate) => {
      const grouped = new Map();
      const daysInMonth = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0
      ).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        grouped.set(
          `${day} ${DATE_CONFIG.formats.MONTHS_COMPLETE[startDate.getMonth()]}`,
          0
        );
      }
      return grouped;
    },
    getKey: (date) =>
      `${date.getDate()} ${
        DATE_CONFIG.formats.MONTHS_COMPLETE[date.getMonth()]
      }`,
    formatLabel: (timestamp) => {
      const [day, month] = timestamp.split(" ");
      const monthIndex = DATE_CONFIG.formats.MONTHS_COMPLETE.indexOf(month);
      return `${day} ${DATE_CONFIG.formats.MONTHS_SHORT[monthIndex]}`;
    },
  },
  [ChartRangeType.YEAR]: {
    getTimeLimit: (startDate) => new Date(startDate),
    initializeData: (startDate) => {
      const grouped = new Map();
      DATE_CONFIG.formats.MONTHS_COMPLETE.forEach((month) =>
        grouped.set(`${month} ${startDate.getFullYear()}`, 0)
      );
      return grouped;
    },
    getKey: (date) =>
      `${
        DATE_CONFIG.formats.MONTHS_COMPLETE[date.getMonth()]
      } ${date.getFullYear()}`,
    formatLabel: (timestamp) => {
      const [month, year] = timestamp.split(" ");
      const monthIndex = DATE_CONFIG.formats.MONTHS_COMPLETE.indexOf(month);
      return `${DATE_CONFIG.formats.MONTHS_SHORT[monthIndex]} ${year}`;
    },
  },
  [ChartRangeType.FIVE_YEAR]: {
    getTimeLimit: (startDate) => {
      const limit = new Date(startDate);
      limit.setFullYear(limit.getFullYear() - 4);
      return limit;
    },
    initializeData: (startDate) => {
      const grouped = new Map();
      for (let i = 4; i >= 0; i--) {
        grouped.set((startDate.getFullYear() - i).toString(), 0);
      }
      return grouped;
    },
    getKey: (date) => date.getFullYear().toString(),
    formatLabel: (timestamp) => timestamp,
  },
};

// Utilidades de Formato
const formatHourMinute = (hour, minute) =>
  `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

// Servicio de Procesamiento de Datos
const chartDataService = {
  getTimeRange(range) {
    const now = new Date();
    const startDate = new Date(now);
    const strategy = timeRangeStrategies[range];

    if (!strategy) return null;

    // Aplicar configuración inicial según el rango
    switch (range) {
      case ChartRangeType.HOUR:
        startDate.setMinutes(0, 0, 0);
        break;
      case ChartRangeType.DAY:
        startDate.setHours(0, 0, 0, 0);
        break;
      case ChartRangeType.WEEK:
        startDate.setHours(0, 0, 0, 0);
        const currentDay = startDate.getDay() || 7;
        startDate.setDate(startDate.getDate() - (currentDay - 1));
        break;
      case ChartRangeType.MONTH:
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case ChartRangeType.YEAR:
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case ChartRangeType.FIVE_YEAR:
        startDate.setFullYear(now.getFullYear());
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    return {
      startDate,
      timeLimit: strategy.getTimeLimit(startDate),
      now,
    };
  },

  processData(data, range) {
    const timeRange = this.getTimeRange(range);
    if (!timeRange) return new Map();

    const strategy = timeRangeStrategies[range];
    const grouped = strategy.initializeData(timeRange.startDate);

    const filteredData = data.filter((msg) => {
      const msgDate = new Date(msg.timestamp);
      return msgDate >= timeRange.timeLimit && msgDate <= timeRange.now;
    });

    filteredData.forEach((msg) => {
      const key = strategy.getKey(new Date(msg.timestamp));
      if (grouped.has(key)) {
        grouped.set(key, grouped.get(key) + 1);
      }
    });

    return grouped;
  },
};

// Propiedades Computadas
const chartData = computed(() => {
  if (!store.stats?.length) return [];

  const grouped = chartDataService.processData(
    store.stats,
    selectedRange.value
  );
  let entries = Array.from(grouped.entries());

  // Ordenamiento específico por tipo de rango
  if (selectedRange.value === ChartRangeType.FIVE_YEAR) {
    entries.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
  } else if (selectedRange.value === ChartRangeType.HOUR) {
    entries.sort((a, b) => {
      const [aHour, aMin] = a[0].split(":").map(Number);
      const [bHour, bMin] = b[0].split(":").map(Number);
      return aHour * 60 + aMin - (bHour * 60 + bMin);
    });
  }

  return entries.map(([timestamp, count]) => ({
    timestamp,
    mensajes: count,
  }));
});

// Formateadores
const xFormatter = computed(() => (value) => {
  const timestamp = chartData.value[value]?.timestamp;
  if (!timestamp) return "";

  const strategy = timeRangeStrategies[selectedRange.value];
  return strategy ? strategy.formatLabel(timestamp) : value;
});

const yFormatter = (value) => value.toLocaleString("es-ES");
</script>

<template>
  <section class="chart-section">
    <template v-if="store.hasStats">
      <Card>
        <!-- Encabezado del Gráfico -->
        <header>
          <CardHeader
            class="flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <CardTitle>Mensajes Recibidos</CardTitle>
            <nav class="w-full sm:w-auto flex justify-end overflow-x-auto">
              <div
                class="inline-flex items-center rounded-md border bg-muted p-1 text-muted-foreground min-w-fit"
              >
                <Button
                  v-for="range in DATE_CONFIG.timeRanges"
                  :key="range.id"
                  @click="selectedRange = range.id"
                  :variant="selectedRange === range.id ? 'default' : 'ghost'"
                  class="px-2.5 whitespace-nowrap"
                  :title="range.description"
                >
                  {{ range.label }}
                </Button>
              </div>
            </nav>
          </CardHeader>
        </header>
        <!-- Contenido del Gráfico -->
        <CardContent>
          <AreaChart
            class="h-[350px]"
            :data="chartData"
            index="timestamp"
            :categories="['mensajes']"
            :curve-type="CurveType.MonotoneX"
            :y-formatter="yFormatter"
            :x-formatter="xFormatter"
            :show-gradiant="true"
          />
        </CardContent>
      </Card>
    </template>
  </section>
</template>
