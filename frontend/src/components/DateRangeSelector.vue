<script setup>
// Componentes UI
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RangeCalendar } from "@/components/ui/range-calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Iconos
import { X } from "lucide-vue-next";

// Stores
import { useMessagesStore } from "../stores/messages";
import { useDevicesStore } from "../stores/devices";

// Utilidades y Hooks
import { ref, computed, watch } from "vue";
import { CalendarDate } from "@internationalized/date";

// Props y Validación
const props = defineProps({
  storeName: {
    type: String,
    default: "messages",
    validator: (value) => ["messages", "devices"].includes(value),
  },
  initialValues: {
    type: Object,
    default: () => ({}),
  },
});

// Inicialización del Store
const getStore = () => {
  switch (props.storeName) {
    case "devices":
      return useDevicesStore();
    default:
      return useMessagesStore();
  }
};

const search = getStore();

// Valores Iniciales y Referencias
const initialDateValue = { start: null, end: null };
const initialTimeValue = { start: "00:00", end: "23:59" };

// Utilidades de Formato
const toCalendarDate = (localDate) => {
  if (!localDate) return null;
  const date = new Date(localDate);
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
};

const fromCalendarDate = (calendarDate) => {
  if (!calendarDate) return null;
  return new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day);
};

const formatTimeFromDate = (date) => {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

// Estado del Componente
const getInitialDateValue = () => {
  if (props.initialValues.startDate && props.initialValues.endDate) {
    return {
      start: toCalendarDate(props.initialValues.startDate),
      end: toCalendarDate(props.initialValues.endDate),
    };
  }
  return { ...initialDateValue };
};

const getInitialTimeValue = () => {
  if (props.initialValues.startDate && props.initialValues.endDate) {
    const startDate = new Date(props.initialValues.startDate);
    const endDate = new Date(props.initialValues.endDate);
    return {
      start: formatTimeFromDate(startDate),
      end: formatTimeFromDate(endDate),
    };
  }
  return { ...initialTimeValue };
};

const dateValue = ref(getInitialDateValue());
const timeValue = ref(getInitialTimeValue());
const showTimeSelection = ref(
  props.initialValues.startDate &&
    (new Date(props.initialValues.startDate).getHours() !== 0 ||
      new Date(props.initialValues.startDate).getMinutes() !== 0)
);
const calendarKey = ref(0);
const dateRange = ref(props.initialValues.dateRange || "");

// Configuración de Rangos
const dateRangeOptions = [
  { value: "last_5_minutes", label: "Últimos 5 minutos" },
  { value: "last_15_minutes", label: "Últimos 15 minutos" },
  { value: "last_30_minutes", label: "Últimos 30 minutos" },
  { value: "last_hour", label: "Última hora" },
  { value: "last_24_hours", label: "Últimas 24 horas" },
  { value: "today", label: "Hoy" },
  { value: "yesterday", label: "Ayer" },
  { value: "last_week", label: "Última semana" },
  { value: "last_month", label: "Último mes" },
  { value: "last_year", label: "Último año" },
];

// Propiedades Computadas
const selectedDateRangeLabel = computed(
  () =>
    dateRangeOptions.find((opt) => opt.value === dateRange.value)?.label ||
    "Selecciona un rango de fechas"
);

const selectedDateLabel = computed(() => {
  if (dateRange.value) return selectedDateRangeLabel.value;
  if (dateValue.value.start && dateValue.value.end) {
    const [start, end] = [dateValue.value.start, dateValue.value.end].map(
      (date) => new Date(date).toLocaleDateString()
    );
    return `${start} - ${end}`;
  }
  return "Selecciona un rango de fechas";
});

const hasDateSelection = computed(
  () => dateRange.value || (dateValue.value.start && dateValue.value.end)
);

// Manejadores de Eventos
const updateDateRange = (range) => {
  if (!range.start || !range.end) return;

  const startDate = fromCalendarDate(range.start);
  const endDate = fromCalendarDate(range.end);

  if (showTimeSelection.value) {
    const [startHours, startMinutes] = timeValue.value.start.split(":");
    const [endHours, endMinutes] = timeValue.value.end.split(":");

    startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0);
    endDate.setHours(parseInt(endHours), parseInt(endMinutes), 59);
  } else {
    startDate.setHours(0, 0, 0);
    endDate.setHours(23, 59, 59);
  }

  search.updateFilters({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    dateRange: "",
  });
};

// Utilidades de Reseteo
const resetToDefaults = () => {
  dateValue.value = getInitialDateValue();
  timeValue.value = getInitialTimeValue();
  showTimeSelection.value = false;
};

const clearDateRange = () => {
  dateRange.value = "";
  search.updateFilters({ dateRange: "" });
};

const clearCalendar = () => {
  resetToDefaults();
  search.updateFilters({ startDate: "", endDate: "" });
};

const clearAll = () => {
  resetToDefaults();
  dateRange.value = "";
  search.updateFilters({
    startDate: "",
    endDate: "",
    dateRange: "",
  });
};

// Utilidades de UI
const getTextColorClass = (hasValue) =>
  hasValue ? "text-foreground" : "text-muted-foreground";

// Exposición de Métodos
defineExpose({ clearAll });

// Observadores
watch(
  dateValue,
  (newValue) => {
    if (newValue.start && newValue.end) {
      clearDateRange();
      updateDateRange(newValue);
    }
  },
  { deep: true }
);

watch(
  dateRange,
  (newValue) => {
    if (newValue) {
      resetToDefaults();
      calendarKey.value += 1;
      search.updateFilters({
        dateRange: newValue,
        startDate: "",
        endDate: "",
      });
    }
  },
  { immediate: true }
);

watch(
  [timeValue, showTimeSelection],
  () => {
    if (dateValue.value.start && dateValue.value.end) {
      updateDateRange(dateValue.value);
    }
  },
  { deep: true }
);
</script>

<template>
  <fieldset class="space-y-2">
    <!-- Etiqueta del Selector -->
    <legend>
      <Label for="date-range-selector">Rango de fecha</Label>
    </legend>

    <Popover>
      <!-- Botón del Selector -->
      <header class="relative">
        <PopoverTrigger as-child>
          <Button
            id="date-range-selector"
            variant="outline"
            :class="[
              'w-full pr-8 justify-start',
              getTextColorClass(hasDateSelection),
              'font-normal',
            ]"
          >
            {{ selectedDateLabel }}
          </Button>
        </PopoverTrigger>
        <button
          v-if="hasDateSelection"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2"
          @click.stop="clearAll"
        >
          <X
            class="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer"
          />
        </button>
      </header>

      <!-- Contenido del Popover -->
      <PopoverContent class="w-auto">
        <article class="grid gap-4">
          <!-- Encabezado -->
          <header class="space-y-2">
            <h4 class="font-medium leading-none">Rango de fechas</h4>
            <p class="text-sm text-muted-foreground">
              Selecciona un período de tiempo para la búsqueda
            </p>
          </header>

          <!-- Controles de Selección -->
          <div class="space-y-4">
            <!-- Selector Rápido de Rangos -->
            <Select v-model="dateRange" class="w-full">
              <SelectTrigger>
                <SelectValue :placeholder="selectedDateRangeLabel" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="option in dateRangeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <!-- Separador -->
            <hr class="border-border border-t" />

            <!-- Selector Personalizado -->
            <p class="text-sm text-muted-foreground">
              O escoge los días y horas que desees
            </p>

            <!-- Contenedor de la Grid -->
            <div class="grid grid-cols-[1fr,180px] gap-4">
              <!-- Calendario -->
              <RangeCalendar
                :key="calendarKey"
                v-model="dateValue"
                class="rounded-md border p-3"
              />

              <!-- Selección de Hora -->
              <fieldset class="space-y-4 p-3 border-border border rounded-md">
                <div>
                  <legend class="flex items-center space-x-2">
                    <Label for="time-selection">Especificar Hora</Label>
                    <Switch
                      id="time-selection"
                      :checked="showTimeSelection"
                      @update:checked="showTimeSelection = $event"
                    />
                  </legend>
                </div>

                <div v-show="showTimeSelection" class="space-y-3">
                  <fieldset class="space-y-1.5">
                    <legend>
                      <Label for="start-time">Hora inicio</Label>
                    </legend>
                    <Input
                      id="start-time"
                      type="time"
                      v-model="timeValue.start"
                    />
                  </fieldset>
                  <fieldset class="space-y-1.5">
                    <legend>
                      <Label for="end-time">Hora fin</Label>
                    </legend>
                    <Input id="end-time" type="time" v-model="timeValue.end" />
                  </fieldset>
                </div>
              </fieldset>
            </div>
          </div>
        </article>
      </PopoverContent>
    </Popover>
  </fieldset>
</template>
