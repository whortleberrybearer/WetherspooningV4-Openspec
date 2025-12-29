<template>
  <Sidebar collapsible="offcanvas" class="overflow-hidden [&>div]:w-[480px]">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" class="data-[state=collapsed]:px-0">
            <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">Wetherspooning</span>
              <span class="truncate text-xs">Pub Tracker</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <!-- Filter Options -->
      <SidebarGroup>
        <SidebarGroupLabel>Options</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <div class="flex items-center justify-between gap-2 px-2 py-1.5">
                <label for="show-closed" class="text-sm cursor-pointer flex-1">
                  Show Closed Pubs
                </label>
                <Switch 
                  :checked="showClosedPubs" 
                  @update:modelValue="$emit('toggleClosedPubs')"
                  id="show-closed"
                />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator />

      <!-- Pub Listings by Country/County -->
      <SidebarGroup v-for="(counties, countryName) in groupedPubs" :key="countryName" as-child>
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
                <Progress :model-value="getCountryProgress(counties)" class="h-2 flex-1" />
                <span class="text-xs text-muted-foreground whitespace-nowrap">{{ getCountryProgressText(counties) }}</span>
              </div>
              <span v-else class="text-xs text-muted-foreground">{{ getCountryTotal(counties) }}</span>
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <!-- Counties within Country -->
              <div v-for="(pubList, countyName) in counties" :key="countyName">
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
                      <Progress :model-value="getCountyProgress(pubList)" class="h-2 flex-1" />
                      <span class="text-xs text-muted-foreground whitespace-nowrap">{{ getCountyProgressText(pubList) }}</span>
                    </div>
                    <span v-else class="text-xs text-muted-foreground">{{ getCountyTotal(pubList) }}</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenu class="ml-4">
                      <SidebarMenuItem v-for="pub in pubList" :key="pub.id">
                        <div class="flex items-start gap-1 w-full">
                          <SidebarMenuButton
                            @click="$emit('selectPub', pub)"
                            :class="[isPubClosed(pub) ? 'opacity-50' : '', 'h-auto py-2 flex-1']"
                          >
                            <div class="flex items-start justify-between gap-2 flex-1 min-w-0">
                              <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                                <span :class="['text-sm break-words', isPubClosed(pub) ? 'text-muted-foreground' : '']">
                                  {{ pub.name }}
                                </span>
                                <span class="text-xs text-muted-foreground">{{ pub.townCity }}</span>
                              </div>
                              <div 
                                v-if="isAuthenticated && isVisited(pub.id)" 
                                class="flex items-center gap-1 text-sm text-green-600 font-medium whitespace-nowrap shrink-0"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <span>{{ formatVisitDate(getVisitDate(pub.id)) }}</span>
                              </div>
                            </div>
                          </SidebarMenuButton>
                          
                          <!-- Track visit icon for unvisited pubs -->
                          <button
                            v-if="isAuthenticated && !isVisited(pub.id)"
                            @click.stop="openPubTracking(pub)"
                            class="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-accent transition-colors shrink-0"
                            title="Track visit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground">
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M12 8v8m-4-4h8"></path>
                            </svg>
                          </button>
                        </div>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem v-if="!isAuthenticated">
          <SidebarMenuButton @click="showLoginDialog = true">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" x2="3" y1="12" y2="12"></line>
            </svg>
            <span>Login</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem v-else>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">{{ user?.username }}</span>
                  <span v-if="user?.email" class="truncate text-xs">{{ user.email }}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-auto size-4">
                  <path d="m7 15 5 5 5-5"/>
                  <path d="m7 9 5-5 5 5"/>
                </svg>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" class="w-[--reka-popper-anchor-width]">
              <DropdownMenuItem @click="handleLogout" class="text-destructive">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" x2="9" y1="12" y2="12"></line>
                </svg>
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>

    <SidebarRail />

    <!-- Login Dialog -->
    <LoginDialog 
      :is-open="showLoginDialog" 
      @close="showLoginDialog = false"
      @open-signup="handleOpenSignup"
    />
    
    <!-- Signup Dialog -->
    <SignupDialog 
      :is-open="showSignupDialog" 
      @close="showSignupDialog = false"
      @open-login="handleOpenLogin"
    />
    
    <!-- Pub Detail Dialog for Visit Tracking -->
    <PubDetailSheet
      v-if="selectedPubForTracking"
      :isOpen="showPubDetailDialog"
      @update:isOpen="showPubDetailDialog = $event"
      :pub="selectedPubForTracking"
    />
  </Sidebar>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/composables/useAuth'
import { useVisits } from '@/composables/useVisits'
import LoginDialog from '@/components/LoginDialog.vue'
import SignupDialog from '@/components/SignupDialog.vue'
import PubDetailSheet from '@/components/PubDetailSheet.vue'

interface Pub {
  id: number
  name: string
  townCity: string
  address: string
  county: string
  region: string
  country: string
  lat: number
  lng: number
  url?: string
  imageUrl?: string
  openState?: string
}

interface Props {
  pubs: Pub[]
  showClosedPubs: boolean
}

const props = defineProps<Props>()
defineEmits<{
  selectPub: [pub: Pub]
  toggleClosedPubs: []
}>()

const { user, isAuthenticated, logout } = useAuth()
const { getGroupCounts, loadVisits, clearVisits, isVisited, getVisitDate } = useVisits()
const showLoginDialog = ref(false)
const showSignupDialog = ref(false)
const selectedPubForTracking = ref<Pub | null>(null)
const showPubDetailDialog = ref(false)

const handleOpenSignup = () => {
  showLoginDialog.value = false
  showSignupDialog.value = true
}

const handleOpenLogin = () => {
  showSignupDialog.value = false
  showLoginDialog.value = true
}

// Watch authentication state to load/clear visit data
watch(isAuthenticated, async (authenticated) => {
  if (authenticated && user.value?.uid) {
    // Load visits when user logs in using Firebase UID
    await loadVisits(user.value.uid)
  } else {
    // Clear visits when user logs out
    clearVisits()
  }
})

const handleLogout = () => {
  logout()
}

const isPubClosed = (pub: Pub): boolean => {
  const state = pub.openState || 'Open'
  return state.toLowerCase().includes('closed')
}

const filteredPubs = computed(() => {
  if (props.showClosedPubs) {
    return props.pubs
  }
  return props.pubs.filter(pub => !isPubClosed(pub))
})

const groupedPubs = computed(() => {
  const grouped: Record<string, Record<string, Pub[]>> = {}

  filteredPubs.value.forEach((pub) => {
    if (!grouped[pub.country]) {
      grouped[pub.country] = {}
    }
    if (!grouped[pub.country]![pub.county]) {
      grouped[pub.country]![pub.county] = []
    }
    grouped[pub.country]![pub.county]!.push(pub)
  })

  const sortedCountries: Record<string, Record<string, Pub[]>> = {}
  Object.keys(grouped)
    .sort()
    .forEach((country) => {
      const counties: Record<string, Pub[]> = {}
      
      Object.keys(grouped[country]!)
        .sort()
        .forEach((county) => {
          const countyPubs = grouped[country]![county]!.sort((a, b) =>
            a.townCity.localeCompare(b.townCity)
          )
          if (countyPubs.length > 0) {
            counties[county] = countyPubs
          }
        })
      
      if (Object.keys(counties).length > 0) {
        sortedCountries[country] = counties
      }
    })

  return sortedCountries
})

const getCountryTotal = (counties: Record<string, Pub[]>) => {
  const allPubs = Object.values(counties).flat()
  
  if (isAuthenticated.value) {
    const { visited, total } = getGroupCounts(allPubs)
    const visitText = visited > 0 ? `✓ ${visited}/${total}` : `${visited}/${total}`
    
    if (props.showClosedPubs) {
      const closedCount = allPubs.filter(isPubClosed).length
      return closedCount > 0 ? `${visitText} (${closedCount} closed)` : visitText
    }
    
    return visitText
  } else {
    const total = allPubs.length
    const closedCount = allPubs.filter(isPubClosed).length
    
    if (props.showClosedPubs) {
      return closedCount > 0 ? `${total} (${closedCount} closed)` : `${total}`
    } else {
      return `${total}`
    }
  }
}

const getCountyTotal = (pubs: Pub[]) => {
  if (isAuthenticated.value) {
    const { visited, total } = getGroupCounts(pubs)
    const visitText = visited > 0 ? `✓ ${visited}/${total}` : `${visited}/${total}`
    
    if (props.showClosedPubs) {
      const closedCount = pubs.filter(isPubClosed).length
      return closedCount > 0 ? `${visitText} (${closedCount} closed)` : visitText
    }
    
    return visitText
  } else {
    const total = pubs.length
    const closedCount = pubs.filter(isPubClosed).length
    
    if (props.showClosedPubs) {
      return closedCount > 0 ? `${total} (${closedCount} closed)` : `${total}`
    } else {
      return `${total}`
    }
  }
}

const formatVisitDate = (isoDate: string | null): string | null => {
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

const getCountryProgress = (counties: Record<string, Pub[]>) => {
  const allPubs = Object.values(counties).flat()
  const { visited, total } = getGroupCounts(allPubs)
  return total > 0 ? (visited / total) * 100 : 0
}

const getCountryProgressText = (counties: Record<string, Pub[]>) => {
  const allPubs = Object.values(counties).flat()
  const { visited, total } = getGroupCounts(allPubs)
  return `${visited}/${total}`
}

const getCountyProgress = (pubs: Pub[]) => {
  const { visited, total } = getGroupCounts(pubs)
  return total > 0 ? (visited / total) * 100 : 0
}

const getCountyProgressText = (pubs: Pub[]) => {
  const { visited, total } = getGroupCounts(pubs)
  return `${visited}/${total}`
}

const openPubTracking = (pub: Pub) => {
  selectedPubForTracking.value = pub
  showPubDetailDialog.value = true
}
</script>
