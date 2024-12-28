<script setup>
// Componentes UI
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldDecrement,
} from "@/components/ui/number-field";

// Iconos
import { RefreshCw } from "lucide-vue-next";

// Utilidades y Hooks
import { ref, watch, onBeforeUnmount } from "vue";

// Props y Configuración
const props = defineProps({
  defaultInterval: {
    type: Number,
    default: 30,
  },
});

const emit = defineEmits(["refresh"]);

// Estado y Referencias
const isEnabled = ref(false);
const interval = ref(Number(props.defaultInterval));
let pollingInterval = null;

// Utilidades de Control
const startPolling = () => {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(() => {
    emit("refresh");
    console.log("Polling...");
  }, Number(interval.value) * 1000);
};

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

// Observadores y Ciclo de Vida
watch([isEnabled, interval], ([newIsEnabled, newInterval]) => {
  stopPolling();
  if (newIsEnabled && newInterval > 0) {
    startPolling();
  }
});

watch(interval, (newVal) => {
  interval.value = Number(newVal);
});

onBeforeUnmount(() => {
  stopPolling();
});
</script>

<template>
  <Popover>
    <!-- Botón de Control -->
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        size="icon"
        class="relative"
        title="Actualización automática"
      >
        <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': isEnabled }" />
      </Button>
    </PopoverTrigger>

    <!-- Panel de Configuración -->
    <PopoverContent class="w-auto mx-4 rounded-lg">
      <div class="grid gap-4">
        <!-- Encabezado -->
        <div class="space-y-2">
          <h4 class="font-medium leading-none">Actualización automática</h4>
          <p class="text-sm text-muted-foreground">
            Configura la frecuencia de actualización de los datos
          </p>
        </div>

        <!-- Controles -->
        <div class="grid gap-4">
          <!-- Switch de Activación -->
          <div class="flex items-center space-x-4">
            <Switch
              id="auto-refresh"
              :checked="isEnabled"
              @update:checked="isEnabled = $event"
            />
            <Label for="auto-refresh">Activar actualización automática</Label>
          </div>

          <!-- Control de Intervalo -->
          <div class="grid gap-2">
            <Label for="interval">Intervalo (segundos)</Label>
            <NumberField
              id="interval"
              :model-value="Number(interval)"
              @update:model-value="interval = $event"
              :disabled="!isEnabled"
              :min="5"
              :max="3600"
            >
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
            <p class="text-xs text-muted-foreground">
              Mínimo: 5 segundos, Máximo: 1 hora
            </p>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
