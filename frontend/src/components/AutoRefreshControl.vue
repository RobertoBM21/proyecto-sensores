<script setup>
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
import { ref, watch, onBeforeUnmount } from "vue";
import { RefreshCw } from "lucide-vue-next";

const props = defineProps({
  defaultInterval: {
    type: Number,
    default: 30,
  },
});

const emit = defineEmits(["refresh"]);

const isEnabled = ref(false);
const interval = ref(Number(props.defaultInterval));
let pollingInterval = null;

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

watch([isEnabled, interval], ([newIsEnabled, newInterval]) => {
  stopPolling();
  if (newIsEnabled && newInterval > 0) {
    startPolling();
  }
});

// Asegurarnos de que interval siempre sea un número
watch(interval, (newVal) => {
  interval.value = Number(newVal);
});

onBeforeUnmount(() => {
  stopPolling();
});
</script>

<template>
  <Popover>
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
    <PopoverContent class="w-80">
      <div class="grid gap-4">
        <div class="space-y-2">
          <h4 class="font-medium leading-none">Actualización automática</h4>
          <p class="text-sm text-muted-foreground">
            Configura la frecuencia de actualización de los datos
          </p>
        </div>
        <div class="grid gap-4">
          <div class="flex items-center space-x-4">
            <Switch
              id="auto-refresh"
              :checked="isEnabled"
              @update:checked="isEnabled = $event"
            />
            <Label for="auto-refresh">Activar actualización automática</Label>
          </div>
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
