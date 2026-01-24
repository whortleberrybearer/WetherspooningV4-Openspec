<template>
  <Sidebar collapsible="offcanvas" class="overflow-hidden [&>div]:w-[480px]">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <div class="flex items-center gap-2 px-2 py-2">
            <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">Wetherspooning</span>
              <span class="truncate text-xs">Visit Tracker</span>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <!-- Visit Statistics -->
      <VisitStatistics 
        v-if="isAuthenticated" 
        :stats="allTimeStats" 
      />

      <SidebarSeparator v-if="isAuthenticated" />

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
      <PubGroupList
        :pubs="pubs"
        :is-authenticated="isAuthenticated"
        :visited-pub-ids="visitedPubIds"
        :pub-visits="pubVisits"
        :show-closed-pubs="showClosedPubs"
        @select-pub="$emit('selectPub', $event)"
      />
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
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/composables/useAuth'
import { useVisits } from '@/composables/useVisits'
import { useTheme } from '@/composables/useTheme'
import LoginDialog from '@/components/LoginDialog.vue'
import PasswordResetDialog from '@/components/PasswordResetDialog.vue'
import SignupDialog from '@/components/SignupDialog.vue'
import PubDetailSheet from '@/components/PubDetailSheet.vue'
import AccountSettingsDialog from '@/components/AccountSettingsDialog.vue'
import VisitStatistics from '@/components/sidebar/VisitStatistics.vue'
import PubGroupList from '@/components/sidebar/PubGroupList.vue'

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
}

const props = defineProps<Props>()
defineEmits<{
  selectPub: [pub: Pub]
  toggleClosedPubs: []
}>()

const { user, isAuthenticated, logout } = useAuth()
const { getGroupCounts, loadVisits, clearVisits, visitedPubIds, visits } = useVisits()
const { isDark, toggleTheme } = useTheme()
const showLoginDialog = ref(false)
const showPasswordResetDialog = ref(false)
const showSignupDialog = ref(false)
const showAccountSettings = ref(false)
const selectedPubForTracking = ref<Pub | null>(null)
const showPubDetailDialog = ref(false)

// Convert visits array to a Map for easier lookup
const pubVisits = computed(() => {
  const map = new Map()
  visits.value.forEach(visit => {
    map.set(visit.pubId, visit)
  })
  return map
})

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

const allTimeStats = computed(() => {
  // Always use all pubs, not filtered
  const { visited } = getGroupCounts(props.pubs)
  
  // Count how many visited pubs are now closed
  const closedVisited = props.pubs.filter(pub => 
    visitedPubIds.has(pub.id) && isPubClosed(pub)
  ).length
  
  // Not visited should only count open pubs that haven't been visited
  const notVisited = props.pubs.filter(pub => 
    !visitedPubIds.has(pub.id) && !isPubClosed(pub)
  ).length
  
  // Total should only count open pubs
  const total = props.pubs.filter(pub => !isPubClosed(pub)).length
  
  return {
    visited,
    notVisited,
    total,
    closedVisited
  }
})

const openPubTracking = (pub: Pub) => {
  selectedPubForTracking.value = pub
  showPubDetailDialog.value = true
}
</script>
