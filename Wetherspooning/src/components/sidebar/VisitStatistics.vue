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
import { computed } from 'vue'
import { SidebarGroup, SidebarGroupContent } from '@/components/ui/sidebar'
import type { Pub, Visit } from '@/services/firebaseDataService'
import { isPubClosed } from '@/utils/pubUtils'

interface Props {
  pubs: Pub[]
  visits: readonly Visit[]
}

const props = defineProps<Props>()

// Compute visitedPubIds Set locally for O(1) lookup
const visitedPubIds = computed(() => new Set(props.visits.map(v => v.pubId)))

const stats = computed(() => {
  const visited = visitedPubIds.value
  
  // Count visited pubs
  const visitedCount = props.pubs.filter(pub => visited.has(pub.id)).length
  
  // Count how many visited pubs are now closed
  const closedVisited = props.pubs.filter(pub => 
    visited.has(pub.id) && isPubClosed(pub)
  ).length
  
  // Not visited should only count open pubs that haven't been visited
  const notVisited = props.pubs.filter(pub => 
    !visited.has(pub.id) && !isPubClosed(pub)
  ).length
  
  // Total should only count open pubs
  const total = props.pubs.filter(pub => !isPubClosed(pub)).length
  
  return {
    visited: visitedCount,
    notVisited,
    total,
    closedVisited
  }
})
</script>
