<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { PanelLeft } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import { useSidebar } from "./utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const { toggleSidebar } = useSidebar()
</script>

<template>
  <Button
    data-sidebar="trigger"
    data-slot="sidebar-trigger"
    variant="ghost"
    size="icon"
    :class="cn('h-7 w-7 bg-background border border-border shadow-sm flex items-center justify-center', props.class)"
    @click="toggleSidebar"
  >
    <PanelLeft class="shrink-0" />
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
