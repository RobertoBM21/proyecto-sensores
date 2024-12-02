<script>
import { useSearchStore } from "../stores/search";
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RangeCalendar } from "@/components/ui/range-calendar";
import { getLocalTimeZone } from "@internationalized/date";
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
import { X } from "lucide-vue-next";

export default {
  components: {
    Button,
    Label,
    Input,
    Switch,
    RangeCalendar,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Popover,
    PopoverContent,
    PopoverTrigger,
    X,
  },
  setup() {
    const search = useSearchStore();
    const dateValue = ref({
      start: null,
      end: null,
    });
    const showTimeSelection = ref(false);
    const timeValue = ref({
      start: "00:00",
      end: "23:59",
    });
    const calendarKey = ref(0);

    return {
      search,
      dateValue,
      showTimeSelection,
      timeValue,
      calendarKey,
    };
  },
  data() {
    return {
      dateRange: "",
      dateRangeOptions: [
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
      ],
    };
  },
  computed: {
    selectedDateRangeLabel() {
      const option = this.dateRangeOptions.find(
        (opt) => opt.value === this.dateRange
      );
      return option ? option.label : "Selecciona un rango de fechas";
    },
    selectedDateLabel() {
      if (this.dateRange) {
        return this.selectedDateRangeLabel;
      }
      if (this.dateValue.start && this.dateValue.end) {
        const start = this.dateValue.start.toDate(getLocalTimeZone());
        const end = this.dateValue.end.toDate(getLocalTimeZone());
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
      }
      return "Selecciona un rango de fechas";
    },
    hasDateSelection() {
      return this.dateRange || (this.dateValue.start && this.dateValue.end);
    },
  },
  methods: {
    getTextColorClass(hasValue) {
      return hasValue ? "text-foreground" : "text-muted-foreground";
    },
    updateDateRange(range) {
      if (range.start && range.end) {
        const startDate = range.start.toDate(getLocalTimeZone());
        const endDate = range.end.toDate(getLocalTimeZone());

        if (this.showTimeSelection) {
          const [startHours, startMinutes] = this.timeValue.start.split(":");
          const [endHours, endMinutes] = this.timeValue.end.split(":");

          startDate.setHours(parseInt(startHours), parseInt(startMinutes));
          endDate.setHours(parseInt(endHours), parseInt(endMinutes), 59);
        } else {
          startDate.setHours(0, 0, 0);
          endDate.setHours(23, 59, 59);
        }

        this.search.setFilters({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          dateRange: "",
        });
      }
    },
    clearDateRange() {
      this.dateRange = "";
      this.search.setFilters({
        dateRange: "",
      });
    },
    clearCalendar() {
      this.dateValue = {
        start: null,
        end: null,
      };
      this.showTimeSelection = false;
      this.timeValue = {
        start: "00:00",
        end: "23:59",
      };
      this.search.setFilters({
        startDate: "",
        endDate: "",
      });
    },
    clearAll() {
      this.dateRange = "";
      this.dateValue = {
        start: null,
        end: null,
      };
      this.showTimeSelection = false;
      this.timeValue = {
        start: "00:00",
        end: "23:59",
      };
      this.search.setFilters({
        startDate: "",
        endDate: "",
        dateRange: "",
      });
    },
  },
  watch: {
    dateValue: {
      handler(newValue) {
        if (newValue.start && newValue.end) {
          this.clearDateRange();
          this.updateDateRange(newValue);
        }
      },
      deep: true,
    },
    dateRange: {
      handler(newValue) {
        if (newValue) {
          // Reset estado visual del calendario
          this.dateValue = {
            start: null,
            end: null,
          };
          // Reset time selection
          this.showTimeSelection = false;
          this.timeValue = {
            start: "00:00",
            end: "23:59",
          };
          this.calendarKey += 1;
          // Update store
          this.search.setFilters({
            dateRange: newValue,
            startDate: "",
            endDate: "",
          });
        }
      },
      immediate: true,
    },
    timeValue: {
      handler() {
        if (this.dateValue.start && this.dateValue.end) {
          this.updateDateRange(this.dateValue);
        }
      },
      deep: true,
    },
    showTimeSelection: function (newValue) {
      if (this.dateValue.start && this.dateValue.end) {
        this.updateDateRange(this.dateValue);
      }
    },
  },
};
</script>

<template>
  <div class="space-y-2">
    <Label for="dateRange">Rango de fecha</Label>
    <Popover>
      <div class="relative">
        <PopoverTrigger as-child>
          <Button
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
        <div
          v-if="hasDateSelection"
          class="absolute right-2 top-1/2 -translate-y-1/2"
          @click.stop="clearAll"
        >
          <X class="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer" />
        </div>
      </div>
      <PopoverContent class="w-auto">
        <div class="grid gap-4">
          <div class="space-y-2">
            <h4 class="font-medium leading-none">Rango de fechas</h4>
            <p class="text-sm text-muted-foreground">
              Selecciona un período de tiempo para la búsqueda
            </p>
          </div>
          <div class="space-y-4">
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

            <div class="border-t"></div>
            <p class="text-sm text-muted-foreground">
              O escoge los días y horas que desees
            </p>

            <div class="grid grid-cols-[1fr,180px] gap-4">
              <RangeCalendar
                :key="calendarKey"
                v-model="dateValue"
                class="rounded-md border p-3"
              />

              <div class="space-y-4 p-3 border rounded-md">
                <div>
                  <div class="flex items-center space-x-2">
                    <Label for="time-selection">Especificar Hora</Label>
                    <Switch
                      id="time-selection"
                      :checked="showTimeSelection"
                      @update:checked="showTimeSelection = $event"
                    />
                  </div>
                </div>

                <div v-show="showTimeSelection" class="space-y-3">
                  <div class="space-y-1.5">
                    <Label for="start-time">Hora inicio</Label>
                    <Input
                      type="time"
                      id="start-time"
                      v-model="timeValue.start"
                    />
                  </div>
                  <div class="space-y-1.5">
                    <Label for="end-time">Hora fin</Label>
                    <Input type="time" id="end-time" v-model="timeValue.end" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
