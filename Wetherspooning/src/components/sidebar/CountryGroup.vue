<template>
  <SidebarGroup as-child>
    <Collapsible :default-open="false" class="group/country">
      <SidebarGroupLabel as-child>
        <CollapsibleTrigger class="w-full hover:bg-accent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="transition-transform group-data-[state=open]/country:rotate-90"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span class="flex-1 text-left">{{ countryName }}</span>
          <div v-if="isAuthenticated" class="flex items-center gap-2 min-w-[100px]">
            <Progress :model-value="progress" class="h-2 flex-1" />
            <span class="text-xs text-muted-foreground whitespace-nowrap">{{ progressText }}</span>
          </div>
          <span v-else class="text-xs text-muted-foreground">{{ totalText }}</span>
        </CollapsibleTrigger>
      </SidebarGroupLabel>
      <CollapsibleContent>
        <SidebarGroupContent>
          <!-- Counties within Country -->
          <div v-for="(pubList, countyName) in counties" :key="countyName">
            <CountyGroup
              :county-name="countyName"
              :pubs="pubList"
              :is-authenticated="isAuthenticated"
              :visited-pub-ids="visitedPubIds"
              :pub-visits="pubVisits"
              :show-closed-pubs="showClosedPubs"
              @select-pub="$emit('selectPub', $event)"
            />
          </div>
        </SidebarGroupContent>
      </CollapsibleContent>
    </Collapsible>
  </SidebarGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import CountyGroup from './CountyGroup.vue'
import type { Pub, Visit } from '@/services/firebaseDataService'

interface Props {
  countryName: string
  counties: Record<string, Pub[]>
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

const allPubs = computed(() => Object.values(props.counties).flat())

const progress = computed(() => {
  const visitedCount = allPubs.value.filter(pub => props.visitedPubIds.has(pub.id)).length
  const total = allPubs.value.length
  return total > 0 ? (visitedCount / total) * 100 : 0
})

const progressText = computed(() => {
  const visitedCount = allPubs.value.filter(pub => props.visitedPubIds.has(pub.id)).length
  return `${visitedCount}/${allPubs.value.length}`
})

const totalText = computed(() => {
  const total = allPubs.value.length
  const closedCount = allPubs.value.filter(isPubClosed).length
  
  if (props.showClosedPubs) {
    return closedCount > 0 ? `${total} (${closedCount} closed)` : `${total}`
  }
  return `${total}`
})
</script>
