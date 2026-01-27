<template>
  <div class="flex h-screen w-full overflow-hidden">
    <!-- Sidebar -->
    <AppSidebar
      :pubs="props.pubs"
      :show-closed-pubs="showClosedPubs"
      :shared-visits-mode="props.sharedVisitsMode"
      :not-found-state="props.notFoundState"
      @selectPub="handlePubSelect"
      @toggleClosedPubs="showClosedPubs = !showClosedPubs"
      @openLogin="showLoginDialog = true"
      @openAccountSettings="showAccountSettings = true"
    />

    <!-- Main Content -->
    <SidebarInset class="flex-1 relative">
      <div class="absolute top-4 left-4 right-4 md:right-auto z-10">
        <div class="flex items-center gap-3">
          <div class="hidden md:block shrink-0">
            <SidebarTrigger />
          </div>
          <!-- Location Search -->
          <LocationSearch
            :is-dark="isDark"
            @place-changed="handlePlaceChanged"
          />
        </div>
        <!-- Mobile: Trigger below search -->
        <div class="md:hidden mt-2">
          <SidebarTrigger />
        </div>
      </div>

      <Alert v-if="props.error" variant="destructive" class="absolute top-20 left-1/2 -translate-x-1/2 max-w-md z-1000">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {{ props.error }}
        </AlertDescription>
      </Alert>

      <GoogleMap
        ref="googleMapRef"
        :pubs="props.pubs"
        :show-closed-pubs="showClosedPubs"
        :visits="props.sharedVisitsMode ? props.sharedVisitsMode.visits : props.visits"
        :is-authenticated="isAuthenticated"
        :is-dark="isDark"
        :user-location="userLocation"
        @update:user-location="userLocation = $event"
        @open-pub-detail="handleOpenPubDetail"
        @open-login="showLoginDialog = true"
      />
    </SidebarInset>

    <!-- Pub Detail Sheet -->
    <PubDetailSheet 
      :pub="selectedPub" 
      :is-open="showPubDetail"
      @update:is-open="showPubDetail = $event"
    />

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

    <!-- Not Found Dialog -->
    <UserNotFoundDialog
      :is-open="props.notFoundState?.isNotFound ?? false"
      :username="props.notFoundState?.username ?? ''"
      @close="handleCloseNotFound"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from '@/components/sidebar/AppSidebar.vue'
import GoogleMap from '@/components/map/GoogleMap.vue'
import PubDetailSheet from '@/components/PubDetailSheet.vue'
import LoginDialog from '@/components/LoginDialog.vue'
import PasswordResetDialog from '@/components/PasswordResetDialog.vue'
import SignupDialog from '@/components/SignupDialog.vue'
import AccountSettingsDialog from '@/components/account-settings/AccountSettingsDialog.vue'
import UserNotFoundDialog from '@/components/UserNotFoundDialog.vue'
import LocationSearch from '@/components/LocationSearch.vue'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import type { Pub } from '@/services/firebaseDataService'

interface Props {
  pubs: Pub[]
  visits: any[]
  error?: string
  sharedVisitsMode?: { userId: string; username: string; visits: any[] } | null
  notFoundState?: { isNotFound: boolean; username: string } | null
  onCloseNotFound?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  error: '',
  sharedVisitsMode: null,
  notFoundState: null,
  onCloseNotFound: undefined
})

const googleMapRef = ref<InstanceType<typeof GoogleMap> | null>(null)
const showClosedPubs = ref(false)
const selectedPub = ref<Pub | null>(null)
const showPubDetail = ref(false)
const showLoginDialog = ref(false)
const showPasswordResetDialog = ref(false)
const showSignupDialog = ref(false)
const showAccountSettings = ref(false)
const userLocation = ref<{ lat: number; lng: number } | null>(null)

const { isAuthenticated } = useAuth()
const { isDark } = useTheme()

const handlePubSelect = (pub: Pub) => {
  googleMapRef.value?.panToPub(pub)
}

const handleOpenPubDetail = (pub: Pub) => {
  selectedPub.value = pub
  showPubDetail.value = true
}

const handleOpenPasswordReset = () => {
  showLoginDialog.value = false
  showPasswordResetDialog.value = true
}

const handleOpenLogin = () => {
  showPasswordResetDialog.value = false
  showLoginDialog.value = true
}

const handleOpenSignup = () => {
  showLoginDialog.value = false
  showSignupDialog.value = true
}

const handlePlaceChanged = (place: google.maps.places.PlaceResult) => {
  googleMapRef.value?.panToPlace(place)
}

const handleCloseNotFound = () => {
  if (props.onCloseNotFound) {
    props.onCloseNotFound()
  }
}
</script>
