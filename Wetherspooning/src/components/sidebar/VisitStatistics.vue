<template>
  <SidebarGroup>
    <SidebarGroupContent>
      <div class="grid grid-cols-2 gap-2 px-2">
        <!-- Total Visited Card -->
        <div class="rounded-lg border bg-card p-3 shadow-sm">
          <div class="flex flex-col gap-1">
            <span class="text-xs text-muted-foreground">Total Visited</span>
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-bold">{{ stats.visited }}</span>
            </div>
            <span class="text-xs text-muted-foreground">{{ stats.closedVisited }} that are now closed</span>
          </div>
        </div>
        
        <!-- Not Visited Card -->
        <div class="rounded-lg border bg-card p-3 shadow-sm">
          <div class="flex flex-col gap-1">
            <span class="text-xs text-muted-foreground">Not Visited</span>
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-bold">{{ stats.notVisited }}</span>
            </div>
            <span class="text-xs text-muted-foreground">{{ stats.total }} Total Pubs</span>
          </div>
        </div>
      </div>
    </SidebarGroupContent>
  </SidebarGroup>
</template>

<script setup lang="ts">
import { SidebarGroup, SidebarGroupContent } from '@/components/ui/sidebar'

interface VisitStats {
  visited: number
  notVisited: number
  total: number
  closedVisited: number
}

interface Props {
  stats: VisitStats
}

defineProps<Props>()
</script>
