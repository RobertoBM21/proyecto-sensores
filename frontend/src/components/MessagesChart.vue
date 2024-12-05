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

const DATE_FORMATS = {
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
};

const groupData = (data, range) => {
  const now = new Date();
  const grouped = new Map();
  const startDate = new Date(now);

  const formatHourMinute = (hour, minute) =>
    `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

  switch (range) {
    case "hour":
      const currentHour = startDate.getHours();
      for (let minute = 0; minute < 60; minute++) {
        grouped.set(formatHourMinute(currentHour, minute), 0);
      }
      break;
    case "day":
      for (let hour = 0; hour <= 24; hour++) {
        grouped.set(formatHourMinute(hour, 0), 0);
      }
      break;
    case "week":
      DATE_FORMATS.DAYS_COMPLETE.forEach((day) => grouped.set(day, 0));
      break;
    case "month":
      const daysInMonth = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0
      ).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const key = `${day} ${
          DATE_FORMATS.MONTHS_COMPLETE[startDate.getMonth()]
        }`;
        grouped.set(key, 0);
      }
      break;
    case "year":
      DATE_FORMATS.MONTHS_COMPLETE.forEach((month) =>
        grouped.set(`${month} ${startDate.getFullYear()}`, 0)
      );
      break;
    case "5year":
      for (let i = 4; i >= 0; i--) {
        const year = startDate.getFullYear() - i;
        grouped.set(year.toString(), 0);
      }
      break;
  }

  data.forEach((msg) => {
    const date = new Date(msg.timestamp);
    let key;

    switch (range) {
      case "hour":
        if (date.getHours() === startDate.getHours()) {
          key = formatHourMinute(date.getHours(), date.getMinutes());
        }
        break;
      case "day":
        const hour = date.getHours();
        key = formatHourMinute(hour, 0);
        break;
      case "week":
        key =
          DATE_FORMATS.DAYS_COMPLETE[
            date.getDay() === 0 ? 6 : date.getDay() - 1
          ];
        break;
      case "month":
        key = `${date.getDate()} ${
          DATE_FORMATS.MONTHS_COMPLETE[date.getMonth()]
        }`;
        break;
      case "year":
        key = `${
          DATE_FORMATS.MONTHS_COMPLETE[date.getMonth()]
        } ${date.getFullYear()}`;
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

const chartData = computed(() => {
  const messages = store.results;
  if (!messages?.length) return [];

  const grouped = groupData(messages, selectedRange.value);
  let entries = Array.from(grouped.entries());

  if (selectedRange.value === "5year") {
    entries = entries.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
  } else if (selectedRange.value === "hour") {
    entries = entries.sort((a, b) => {
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

const xFormatter = computed(() => (value) => {
  const timestamp = chartData.value[value]?.timestamp;
  if (!timestamp) return "";

  switch (selectedRange.value) {
    case "hour": {
      const [h, minute] = timestamp.split(":").map(Number);
      return minute % 10 === 0 ? timestamp : "";
    }
    case "day":
      return timestamp;
    case "week": {
      const dayIndex = DATE_FORMATS.DAYS_COMPLETE.indexOf(timestamp);
      return DATE_FORMATS.DAYS_SHORT[dayIndex];
    }
    case "month": {
      const [day, month] = timestamp.split(" ");
      const monthIndex = DATE_FORMATS.MONTHS_COMPLETE.indexOf(month);
      return `${day} ${DATE_FORMATS.MONTHS_SHORT[monthIndex]}`;
    }
    case "year": {
      const [month, year] = timestamp.split(" ");
      const monthIndex = DATE_FORMATS.MONTHS_COMPLETE.indexOf(month);
      return `${DATE_FORMATS.MONTHS_SHORT[monthIndex]} ${year}`;
    }
    case "5year": {
      return timestamp;
    }
    default:
      return value;
  }
});

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
          :categories="['mensajes']"
          :curve-type="CurveType.MonotoneX"
          :y-formatter="yFormatter"
          :x-formatter="xFormatter"
          :show-gradiant="true"
        />
      </CardContent>
    </Card>
  </div>
</template>
