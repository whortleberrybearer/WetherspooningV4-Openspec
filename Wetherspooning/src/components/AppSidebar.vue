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
      <!-- Shared View Banner -->
      <div v-if="sharedVisitsMode" class="px-2 py-3 bg-primary/10 border-b border-primary/20">
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium">@{{ sharedVisitsMode.username }}'s Visits</span>
            <span class="text-xs text-muted-foreground">Public visit data</span>
          </div>
          <button
            v-if="isAuthenticated"
            @click="router.push('/')"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3"
          >
            My Visits
          </button>
          <button
            v-else
            @click="router.push('/')"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3"
          >
            Start Tracking
          </button>
        </div>
      </div>

      <!-- Visit Statistics -->
      <SidebarGroup v-if="isAuthenticated || sharedVisitsMode">
        <SidebarGroupContent>
          <div class="grid grid-cols-2 gap-2 px-2">
            <!-- Total Visited Card -->
            <div class="rounded-lg border bg-card p-3 shadow-sm">
              <div class="flex flex-col gap-1">
                <span class="text-xs text-muted-foreground">Total Visited</span>
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-bold">{{ allTimeStats.visited }}</span>
                </div>
                <span class="text-xs text-muted-foreground">{{ allTimeStats.closedVisited }} that are now closed</span>
              </div>
            </div>
            
            <!-- Not Visited Card -->
            <div class="rounded-lg border bg-card p-3 shadow-sm">
              <div class="flex flex-col gap-1">
                <span class="text-xs text-muted-foreground">Not Visited</span>
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-bold">{{ allTimeStats.notVisited }}</span>
                </div>
                <span class="text-xs text-muted-foreground">{{ allTimeStats.total }} Total Pubs</span>
              </div>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator v-if="isAuthenticated || sharedVisitsMode" />

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
                                <span :class="['text-sm break-words flex items-center gap-1', isPubClosed(pub) ? 'text-muted-foreground' : '']">
                                  <span v-if="pub.isHotel" title="Hotel">🏨</span>
                                  <span v-if="pub.inAirport" title="Airport">✈️</span>
                                  <span v-if="pub.inTrainStation" title="Train Station">🚂</span>
                                  <span>{{ pub.name }}</span>
                                </span>
                                <span class="text-xs text-muted-foreground">{{ pub.townCity }}</span>
                              </div>
                              <div 
                                v-if="(isAuthenticated || sharedVisitsMode) && isSharedVisited(pub.id)" 
                                class="flex items-center gap-1 text-sm text-green-600 font-medium whitespace-nowrap shrink-0"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <span>{{ formatVisitDate(getSharedVisitDate(pub.id)) }}</span>
                              </div>
                            </div>
                          </SidebarMenuButton>
                          
                          <!-- Track visit icon for unvisited pubs (only in own mode) -->
                          <button
                            v-if="isAuthenticated && !sharedVisitsMode && !isSharedVisited(pub.id)"
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
        <!-- Theme Toggle -->
        <SidebarMenuItem>
          <div class="flex items-center justify-between gap-2 px-2 py-1.5">
            <label for="theme-toggle" class="text-sm cursor-pointer flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="14" x="2" y="3" rx="2"></rect>
                <line x1="8" x2="16" y1="21" y2="21"></line>
                <line x1="12" x2="12" y1="17" y2="21"></line>
              </svg>
              <span>Theme</span>
            </label>
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="!isDark ? 'text-foreground' : 'text-muted-foreground'">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
              </svg>
              <Switch 
                :default-value="isDark" 
                @update:modelValue="toggleTheme"
                id="theme-toggle"
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="isDark ? 'text-foreground' : 'text-muted-foreground'">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
            </div>
          </div>
        </SidebarMenuItem>

        <!-- Account Settings (when authenticated) -->
        <SidebarMenuItem v-if="isAuthenticated">
          <SidebarMenuButton @click="showAccountSettings = true">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>Account Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <!-- Login Button (when not authenticated) -->
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

        <!-- User Profile with Inline Logout (when authenticated) -->
        <SidebarMenuItem v-else>
          <SidebarMenuButton size="lg" class="pr-2">
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
            <Button 
              @click.stop="handleLogout" 
              variant="ghost" 
              size="icon"
              class="ml-auto h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              aria-label="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" x2="9" y1="12" y2="12"></line>
              </svg>
            </Button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>

    <SidebarRail />

    <!-- Login Dialog -->
    <LoginDialog 
      :is-open="showLoginDialog" 
      @close="showLoginDialog = false"
      @open-signup="handleOpenSignup"
      @open-password-reset="handleOpenPasswordReset"
    />
    
    <!-- Password Reset Dialog -->
    <PasswordResetDialog
      :is-open="showPasswordResetDialog"
      @close="showPasswordResetDialog = false"
      @open-login="handleOpenLogin"
    />
    
    <!-- Signup Dialog -->
    <SignupDialog 
      :is-open="showSignupDialog" 
      @close="showSignupDialog = false"
      @open-login="handleOpenLogin"
    />

    <!-- Account Settings Dialog -->
    <AccountSettingsDialog
      :is-open="showAccountSettings"
      @update:is-open="showAccountSettings = $event"
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
import { useRouter } from 'vue-router'
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
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/composables/useAuth'
import { useVisits } from '@/composables/useVisits'
import { useTheme } from '@/composables/useTheme'
import LoginDialog from '@/components/LoginDialog.vue'
import PasswordResetDialog from '@/components/PasswordResetDialog.vue'
import SignupDialog from '@/components/SignupDialog.vue'
import PubDetailSheet from '@/components/PubDetailSheet.vue'
import AccountSettingsDialog from '@/components/AccountSettingsDialog.vue'

interface Pub {
  id: string
  name: string
  townCity: string
  address: string
  county: string
  region?: string
  country?: string
  position: {
    lat: number
    lng: number
  } | null
  url?: string
  imageUrl?: string
  openState?: string
  isHotel?: boolean
  inAirport?: boolean
  inTrainStation?: boolean
}

interface Props {
  pubs: Pub[]
  showClosedPubs: boolean
  sharedVisitsMode?: {
    userId: string
    username: string
    visits: any[]
  } | null
}

const props = defineProps<Props>()
defineEmits<{
  selectPub: [pub: Pub]
  toggleClosedPubs: []
}>()

const router = useRouter()
const { user, isAuthenticated, logout } = useAuth()
const { getGroupCounts, loadVisits, clearVisits, isVisited, getVisitDate } = useVisits()
const { isDark, toggleTheme } = useTheme()

// Shared visit state helpers
const sharedVisitIds = computed(() => {
  if (!props.sharedVisitsMode) return new Set<string>()
  return new Set(props.sharedVisitsMode.visits.map(v => v.pubId))
})

const isSharedVisited = (pubId: string): boolean => {
  return props.sharedVisitsMode ? sharedVisitIds.value.has(pubId) : isVisited(pubId)
}

const getSharedVisitDate = (pubId: string): string | null => {
  if (!props.sharedVisitsMode) return getVisitDate(pubId)
  const visit = props.sharedVisitsMode.visits.find(v => v.pubId === pubId)
  return visit?.visitedAt || null
}
const showLoginDialog = ref(false)
const showPasswordResetDialog = ref(false)
const showSignupDialog = ref(false)
const showAccountSettings = ref(false)
const selectedPubForTracking = ref<Pub | null>(null)
const showPubDetailDialog = ref(false)

const handleOpenSignup = () => {
  showLoginDialog.value = false
  showSignupDialog.value = true
}

const handleOpenLogin = () => {
  showSignupDialog.value = false
  showPasswordResetDialog.value = false
  showLoginDialog.value = true
}

const handleOpenPasswordReset = () => {
  showLoginDialog.value = false
  showPasswordResetDialog.value = true
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
  return state === 'Closed'
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
    const country = pub.country || 'Unknown'
    const county = pub.county || 'Unknown'
    
    if (!grouped[country]) {
      grouped[country] = {}
    }
    if (!grouped[country]![county]) {
      grouped[country]![county] = []
    }
    grouped[country]![county]!.push(pub)
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

const allTimeStats = computed(() => {
  // Check if we're in shared mode or own mode
  const checkVisited = props.sharedVisitsMode ? isSharedVisited : isVisited
  
  // Always use all pubs, not filtered
  const visitedCount = props.pubs.filter(pub => checkVisited(pub.id)).length
  
  // Count how many visited pubs are now closed
  const closedVisited = props.pubs.filter(pub => 
    checkVisited(pub.id) && isPubClosed(pub)
  ).length
  
  // Not visited should only count open pubs that haven't been visited
  const notVisited = props.pubs.filter(pub => 
    !checkVisited(pub.id) && !isPubClosed(pub)
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
  const visited = allPubs.filter(pub => isSharedVisited(pub.id)).length
  const total = allPubs.length
  return total > 0 ? (visited / total) * 100 : 0
}

const getCountryProgressText = (counties: Record<string, Pub[]>) => {
  const allPubs = Object.values(counties).flat()
  const visited = allPubs.filter(pub => isSharedVisited(pub.id)).length
  const total = allPubs.length
  return `${visited}/${total}`
}

const getCountyProgress = (pubs: Pub[]) => {
  const visited = pubs.filter(pub => isSharedVisited(pub.id)).length
  const total = pubs.length
  return total > 0 ? (visited / total) * 100 : 0
}

const getCountyProgressText = (pubs: Pub[]) => {
  const visited = pubs.filter(pub => isSharedVisited(pub.id)).length
  const total = pubs.length
  return `${visited}/${total}`
}

const openPubTracking = (pub: Pub) => {
  selectedPubForTracking.value = pub
  showPubDetailDialog.value = true
}
</script>
