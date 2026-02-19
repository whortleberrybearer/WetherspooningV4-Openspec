<template>
  <div class="flex h-screen w-full overflow-hidden">
    <!-- Sidebar -->
    <AppSidebar
      :pubs="pubs"
      :show-closed-pubs="showClosedPubs"
      :visits="props.visits"
      :shared-username="props.sharedUsername"
      @selectPub="handlePubSelect"
      @toggleClosedPubs="showClosedPubs = !showClosedPubs"
      @openLogin="showLoginDialog = true"
      @openAccountSettings="showAccountSettings = true"
      @navigateToMyVisits="handleNavigateToMyVisits"
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

      <Alert v-if="error" variant="destructive" class="absolute top-20 left-1/2 -translate-x-1/2 max-w-md z-1000">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {{ error }}
        </AlertDescription>
      </Alert>

      <GoogleMap
        ref="googleMapRef"
        :pubs="pubs"
        :show-closed-pubs="showClosedPubs"
        :visits="props.visits"
        :is-authenticated="isAuthenticated"
        :is-dark="isDark"
        :user-location="userLocation"
        :readonly="props.readonly"
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
    <!-- Account Settings Dialog -->
    <AccountSettingsDialog
      :is-open="showAccountSettings"
      @update:is-open="showAccountSettings = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/sidebar/AppSidebar.vue'
import GoogleMap from '@/components/map/GoogleMap.vue'
import PubDetailSheet from '@/components/PubDetailSheet.vue'
import LoginDialog from '@/components/LoginDialog.vue'
import PasswordResetDialog from '@/components/PasswordResetDialog.vue'
import SignupDialog from '@/components/SignupDialog.vue'
import AccountSettingsDialog from '@/components/account-settings/AccountSettingsDialog.vue'
import LocationSearch from '@/components/LocationSearch.vue'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import { getAllPubs } from '@/services/pubDataService'
import type { Pub } from '@/services/firebaseDataService'

interface Props {
  visits: readonly any[]
  sharedUsername?: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sharedUsername: '',
  readonly: false
})

const googleMapRef = ref<InstanceType<typeof GoogleMap> | null>(null)
const pubs = ref<Pub[]>([])
const error = ref<string>('')
const showClosedPubs = ref(false)
const selectedPub = ref<Pub | null>(null)
const showPubDetail = ref(false)
const showLoginDialog = ref(false)
const showPasswordResetDialog = ref(false)
const showSignupDialog = ref(false)
const showAccountSettings = ref(false)
const userLocation = ref<{ lat: number; lng: number } | null>(null)

const { isAuthenticated } = useAuth()
const router = useRouter()
const { isDark } = useTheme()

const loadPubs = async () => {
  try {
    console.log('PubLocationsMap: Loading pubs...')
    const data = await getAllPubs()
    pubs.value = data
    console.log('PubLocationsMap: Pubs loaded:', data.length, 'pubs')
  } catch (err) {
    const errorMsg = 'Failed to load pub locations. Please check your connection and try again.'
    error.value = errorMsg
    console.error('Error loading pubs from Firestore:', err)
  }
}

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
const handleNavigateToMyVisits = () => {
  router.push('/')
}


onMounted(async () => {
  console.log('PubLocationsMap mounted with props:', { 
    visitsLength: props.visits.length
  })
  await loadPubs()
  console.log('PubLocationsMap: Pubs loaded, ready to render map')
})
</script>
