<template>
  <Collapsible :default-open="false" class="group/county">
    <CollapsibleTrigger class="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="transition-transform group-data-[state=open]/county:rotate-90"
      >
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
      <span class="flex-1 text-left font-medium">{{ countyName }}</span>
      <div v-if="isAuthenticated" class="flex items-center gap-2 min-w-[100px]">
        <Progress :model-value="progress" class="h-2 flex-1" />
        <span class="text-xs text-muted-foreground whitespace-nowrap">{{ progressText }}</span>
      </div>
      <span v-else class="text-xs text-muted-foreground">{{ totalText }}</span>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <SidebarMenu class="pl-4">
        <SidebarMenuItem v-for="pub in pubs" :key="pub.id">
          <SidebarMenuButton
            @click="$emit('selectPub', pub)"
            :class="[isPubClosed(pub) ? 'opacity-50' : '', 'h-auto py-2']"
          >
            <div class="flex flex-col gap-0.5 flex-1 min-w-0">
              <!-- First row: Name and Visit Date -->
              <div class="flex items-center justify-between gap-2">
                <span :class="['text-sm break-words flex items-center gap-1 flex-1', isPubClosed(pub) ? 'text-muted-foreground' : '']">
                  <span>{{ pub.name }}</span>
                  <span v-if="pub.isHotel" title="Hotel">🏨</span>
                  <span v-if="pub.inAirport" title="Airport">✈️</span>
                  <span v-if="pub.inTrainStation" title="Train Station">🚂</span>
                </span>
                <div 
                  v-if="isAuthenticated && visitedPubIds.has(pub.id)" 
                  class="flex items-center gap-1 text-sm text-green-600 font-medium whitespace-nowrap shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>{{ formatVisitDate(pubVisits.get(pub.id)?.visitedAt) }}</span>
                </div>
              </div>
              <!-- Second row: Town/City and State -->
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs text-muted-foreground">{{ pub.townCity }}</span>
                <span 
                  v-if="pub.openState && pub.openState !== 'Open' && pub.openState !== 'Closed'" 
                  class="text-xs text-muted-foreground whitespace-nowrap shrink-0"
                >
                  {{ pub.openState }}
                </span>
              </div>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </CollapsibleContent>
  </Collapsible>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Progress } from '@/components/ui/progress'
import type { Pub, Visit } from '@/services/firebaseDataService'

interface Props {
  countyName: string
  pubs: Pub[]
  isAuthenticated: boolean
  visitedPubIds: ReadonlySet<string>
  pubVisits: Map<string, Visit>
  showClosedPubs: boolean
}

const props = defineProps<Props>()

defineEmits<{
  selectPub: [pub: Pub]
}>()

const isPubClosed = (pub: Pub): boolean => {
  const state = pub.openState || 'Open'
  return state === 'Closed'
}

const progress = computed(() => {
  const visitedCount = props.pubs.filter(pub => props.visitedPubIds.has(pub.id)).length
  const total = props.pubs.length
  return total > 0 ? (visitedCount / total) * 100 : 0
})

const progressText = computed(() => {
  const visitedCount = props.pubs.filter(pub => props.visitedPubIds.has(pub.id)).length
  return `${visitedCount}/${props.pubs.length}`
})

const totalText = computed(() => {
  const total = props.pubs.length
  const closedCount = props.pubs.filter(isPubClosed).length
  
  if (props.showClosedPubs) {
    return closedCount > 0 ? `${total} (${closedCount} closed)` : `${total}`
  }
  return `${total}`
})

const formatVisitDate = (isoDate: string | null | undefined): string | null => {
  if (!isoDate) return null
  
  try {
    const date = new Date(isoDate)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return null
  }
}
</script>
