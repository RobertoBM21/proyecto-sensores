<script setup>
// UI components
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

// Icons
import { X } from "lucide-vue-next";

// Store
import { useMessagesStore } from "../stores/messages";
import { useDevicesStore } from "../stores/devices";

// Utilities
import { ref, computed, watch } from "vue";
import { getLocalTimeZone } from "@internationalized/date";

// Prop para determinar qué store usar
const props = defineProps({
  storeName: {
    type: String,
    default: "messages",
    validator: (value) => ["messages", "devices"].includes(value),
  },
});

// Store initialization ajustado
const getStore = () => {
  switch (props.storeName) {
    case "devices":
      return useDevicesStore();
    default:
      return useMessagesStore();
  }
};

const search = getStore();

// Initial states
const initialDateValue = { start: null, end: null };
const initialTimeValue = { start: "00:00", end: "23:59" };

// Component state
const dateValue = ref({ ...initialDateValue });
const timeValue = ref({ ...initialTimeValue });
const showTimeSelection = ref(false);
const calendarKey = ref(0);
const dateRange = ref("");

// Date range options
const dateRangeOptions = [
  { value: "last_5_minutes", label: "Últimos 5 minutos" },
  { value: "last_15_minutes", label: "Últimos 15 minutos" },
  { value: "last_30_minutes", label: "Últimos 30 minutos" },
  { value: "last_hour", label: "Última hora" },
  { value: "today", label: "Hoy" },
  { value: "last_24_hours", label: "Últimas 24 horas" },
  { value: "yesterday", label: "Ayer" },
  { value: "last_week", label: "Última semana" },
  { value: "last_month", label: "Último mes" },
  { value: "last_year", label: "Último año" },
];

// Computed properties
const selectedDateRangeLabel = computed(
  () =>
    dateRangeOptions.find((opt) => opt.value === dateRange.value)?.label ||
    "Selecciona un rango de fechas"
);

const selectedDateLabel = computed(() => {
  if (dateRange.value) return selectedDateRangeLabel.value;
  if (dateValue.value.start && dateValue.value.end) {
    const [start, end] = [dateValue.value.start, dateValue.value.end].map(
      (date) => date.toDate(getLocalTimeZone()).toLocaleDateString()
    );
    return `${start} - ${end}`;
  }
  return "Selecciona un rango de fechas";
});

const hasDateSelection = computed(
  () => dateRange.value || (dateValue.value.start && dateValue.value.end)
);

// Methods
const updateDateRange = (range) => {
  if (!range.start || !range.end) return;

  const startDate = range.start.toDate(getLocalTimeZone());
  const endDate = range.end.toDate(getLocalTimeZone());

  if (showTimeSelection.value) {
    setTimeOnDate(startDate, timeValue.value.start);
    setTimeOnDate(endDate, timeValue.value.end).setSeconds(59);
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

// Reset methods
const resetToDefaults = () => {
  dateValue.value = { ...initialDateValue };
  timeValue.value = { ...initialTimeValue };
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

// Helper methods
const getTextColorClass = (hasValue) =>
  hasValue ? "text-foreground" : "text-muted-foreground";

const setTimeOnDate = (date, timeString) => {
  const [hours, minutes] = timeString.split(":");
  date.setHours(parseInt(hours), parseInt(minutes));
  return date;
};

// Expose clearAll method
defineExpose({ clearAll });

// Watchers
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
    <legend>
      <Label for="date-range-selector">Rango de fecha</Label>
    </legend>
    <Popover>
      <!-- Date Range Selector Button -->
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

      <!-- Popover Content -->
      <PopoverContent class="w-auto">
        <article class="grid gap-4">
          <!-- Header -->
          <header class="space-y-2">
            <h4 class="font-medium leading-none">Rango de fechas</h4>
            <p class="text-sm text-muted-foreground">
              Selecciona un período de tiempo para la búsqueda
            </p>
          </header>

          <!-- Selection Controls Container -->
          <div class="space-y-4">
            <!-- Quick Date Range Select -->
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

            <hr class="border-border border-t" />

            <!-- Custom Date Range -->
            <p class="text-sm text-muted-foreground">
              O escoge los días y horas que desees
            </p>

            <!-- Grid Container -->
            <div class="grid grid-cols-[1fr,180px] gap-4">
              <!-- Calendar -->
              <RangeCalendar
                :key="calendarKey"
                v-model="dateValue"
                class="rounded-md border p-3"
              />

              <!-- Time Selection -->
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
