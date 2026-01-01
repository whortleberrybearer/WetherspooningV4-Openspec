<template>
  <div class="flex gap-1">
    <button
      v-for="star in 5"
      :key="star"
      type="button"
      @click="handleClick(star)"
      @mouseenter="handleHover(star)"
      @mouseleave="handleHover(0)"
      :disabled="disabled"
      class="text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      :class="star <= displayRating ? 'text-yellow-500' : 'text-muted-foreground/30'"
    >
      {{ star <= displayRating ? '★' : '☆' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue?: number
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: number | undefined): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const hoverRating = ref(0)

const displayRating = computed(() => {
  return hoverRating.value || props.modelValue || 0
})

const handleClick = (rating: number) => {
  if (props.disabled) return
  // If clicking the same rating, clear it
  if (props.modelValue === rating) {
    emit('update:modelValue', undefined)
  } else {
    emit('update:modelValue', rating)
  }
}

const handleHover = (rating: number) => {
  if (props.disabled) return
  hoverRating.value = rating
}
</script>
