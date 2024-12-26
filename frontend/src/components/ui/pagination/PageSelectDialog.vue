<script setup>
import { ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldDecrement,
} from "@/components/ui/number-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const props = defineProps({
  isOpen: Boolean,
  totalPages: Number,
  currentPage: Number,
});

const emit = defineEmits(["update:isOpen", "select"]);

const pageNumber = ref(props.currentPage);

watch(
  () => props.currentPage,
  (newValue) => {
    pageNumber.value = newValue;
  }
);

const handleSubmit = () => {
  emit("select", pageNumber.value);
  emit("update:isOpen", false);
};
</script>

<template>
  <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <DialogContent
      class="sm:max-w-[425px] mx-auto rounded-lg w-[calc(100%-2rem)] left-[50%] -translate-x-[50%]"
    >
      <DialogHeader>
        <DialogTitle>Ir a la página</DialogTitle>
        <DialogDescription>
          Ingresa el número de página a la que deseas ir
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <NumberField
          :default-value="currentPage"
          :min="1"
          :max="totalPages"
          v-model="pageNumber"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
        <small class="text-muted-foreground">
          Página {{ pageNumber }} de {{ totalPages }}
        </small>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="$emit('update:isOpen', false)">
          Cancelar
        </Button>
        <Button @click="handleSubmit">Aceptar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
