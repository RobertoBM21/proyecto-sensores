<script setup>
import { computed, ref } from "vue";
import { useMessagesStore } from "../stores/messages";
import { AreaChart } from "@/components/ui/chart-area";
import { CurveType } from "@unovis/ts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const store = useMessagesStore();

const timeRanges = [
  { id: "hour", label: "1H", description: "Última hora" },
  { id: "day", label: "1D", description: "Último día" },
  { id: "week", label: "1S", description: "Última semana" },
  { id: "month", label: "1M", description: "Último mes" },
  { id: "year", label: "1A", description: "Último año" },
  { id: "5year", label: "5A", description: "Últimos 5 años" },
];

const selectedRange = ref("hour");

// Función para agrupar datos según el rango seleccionado
const groupData = (data, range) => {
  const now = new Date();
  const grouped = new Map();
  const startDate = new Date(now);

  switch (range) {
    case "hour":
      // Obtener la hora actual y crear intervalos de 5 minutos
      const currentHour = startDate.getHours();
      for (let minute = 0; minute < 60; minute += 5) {
        const timeStr = `${currentHour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        grouped.set(timeStr, 0);
      }
      break;
    case "day":
      for (let hour = 0; hour < 24; hour++) {
        const hourStr = hour.toString().padStart(2, "0");
        grouped.set(hourStr, 0);
      }
      break;
    case "week":
      const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
      weekDays.forEach((day) => grouped.set(day, 0));
      break;
    case "month":
      const daysInMonth = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0
      ).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        grouped.set(day.toString(), 0);
      }
      break;
    case "year":
      const months = [
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
      ];
      months.forEach((month) => grouped.set(month, 0));
      break;
    case "5year":
      // Ajustar para incluir el año actual y los 4 anteriores en orden cronológico
      for (let i = 4; i >= 0; i--) {
        const year = startDate.getFullYear() - i;
        grouped.set(year.toString(), 0);
      }
      break;
  }

  // Agrupar los mensajes
  data.forEach((msg) => {
    const date = new Date(msg.timestamp);
    let key;

    switch (range) {
      case "hour":
        // Solo procesar mensajes de la hora actual
        if (date.getHours() === startDate.getHours()) {
          const minutes = Math.floor(date.getMinutes() / 5) * 5;
          key = `${date.getHours().toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;
        }
        break;
      case "day":
        key = date.getHours().toString().padStart(2, "0");
        break;
      case "week":
        const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        key = weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1];
        break;
      case "month":
        key = date.getDate().toString();
        break;
      case "year":
        const months = [
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
        ];
        key = months[date.getMonth()];
        break;
      case "5year":
        key = date.getFullYear().toString();
        break;
    }

    if (grouped.has(key)) {
      grouped.set(key, grouped.get(key) + 1);
    }
  });

  return grouped;
};

// Aseguramos que los datos se muestren en el orden correcto
const chartData = computed(() => {
  const messages = store.results;
  if (!messages?.length) return [];

  const grouped = groupData(messages, selectedRange.value);
  let entries = Array.from(grouped.entries());

  // Ordenar según el rango seleccionado
  if (selectedRange.value === "5year") {
    entries = entries.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
  } else if (selectedRange.value === "hour") {
    // Asegurar orden cronológico para las horas
    entries = entries.sort((a, b) => {
      const [aHour, aMin] = a[0].split(":").map(Number);
      const [bHour, bMin] = b[0].split(":").map(Number);
      return aHour * 60 + aMin - (bHour * 60 + bMin);
    });
  }

  return entries.map(([timestamp, count]) => ({
    timestamp,
    messages: count,
  }));
});

// Ajustar el formateador del eje X según el rango seleccionado
const xFormatter = computed(() => (value) => {
  switch (selectedRange.value) {
    case "hour":
      // Asumiendo que value es un número que representa minutos
      const hour = Math.floor(value / 60);
      const minute = value % 60;
      return `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
    case "day":
      return value.toString().padStart(2, "0") + "h";
    case "week":
      return value;
    case "month":
      return "Día " + value.toString().padStart(2, "0");
    case "year":
      return value;
    case "5year":
      return value;
    default:
      return value;
  }
});

// Formateador para el eje Y (cuenta de mensajes)
const yFormatter = (value) => {
  return value.toLocaleString("es-ES");
};
</script>

<template>
  <div v-if="store.hasResults">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between">
        <CardTitle>Mensajes Recibidos</CardTitle>
        <div
          class="inline-flex items-center rounded-md border bg-muted p-1 text-muted-foreground"
        >
          <Button
            v-for="range in timeRanges"
            :key="range.id"
            @click="selectedRange = range.id"
            :variant="selectedRange === range.id ? 'default' : 'ghost'"
            class="px-2.5"
            :title="range.description"
          >
            {{ range.label }}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AreaChart
          class="h-[300px]"
          :data="chartData"
          index="timestamp"
          :categories="['messages']"
          :curve-type="CurveType.MonotoneX"
          :y-formatter="yFormatter"
          :x-formatter="xFormatter"
          :show-gradiant="true"
        />
      </CardContent>
    </Card>
  </div>
</template>
