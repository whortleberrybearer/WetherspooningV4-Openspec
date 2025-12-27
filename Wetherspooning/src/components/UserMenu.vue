<template>
  <div class="relative">
    <!-- Menu Trigger -->
    <button
      @click.stop="isOpen = !isOpen"
      @keydown.escape="isOpen = false"
      class="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent rounded-md transition-colors"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      aria-label="User menu"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      <span>{{ user?.username }}</span>
      <svg
        :class="['transition-transform duration-200', isOpen ? 'rotate-180' : '']"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        v-click-outside="handleClickOutside"
        class="absolute top-full mt-1 left-0 bg-background border border-border rounded-md shadow-lg py-1 min-w-50 z-10"
        role="menu"
        aria-orientation="vertical"
      >
        <!-- User Info -->
        <div class="px-3 py-2 border-b border-border">
          <p class="text-sm font-medium">{{ user?.username }}</p>
          <p v-if="user?.email" class="text-xs text-muted-foreground">{{ user.email }}</p>
        </div>

        <!-- Future Features (Disabled) -->
        <div class="py-1">
          <button
            disabled
            class="w-full text-left px-3 py-2 text-sm text-muted-foreground cursor-not-allowed flex items-center justify-between"
            role="menuitem"
          >
            <span>Preferences</span>
            <span class="text-xs">Coming Soon</span>
          </button>
          <button
            disabled
            class="w-full text-left px-3 py-2 text-sm text-muted-foreground cursor-not-allowed flex items-center justify-between"
            role="menuitem"
          >
            <span>Change Password</span>
            <span class="text-xs">Coming Soon</span>
          </button>
          <button
            disabled
            class="w-full text-left px-3 py-2 text-sm text-muted-foreground cursor-not-allowed flex items-center justify-between"
            role="menuitem"
          >
            <span>Profile</span>
            <span class="text-xs">Coming Soon</span>
          </button>
        </div>

        <!-- Divider -->
        <div class="border-t border-border my-1"></div>

        <!-- Logout -->
        <button
          @click="handleLogout"
          class="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors text-destructive"
          role="menuitem"
        >
          Logout
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { user, logout } = useAuth()
const isOpen = ref(false)

const handleLogout = () => {
  logout()
  isOpen.value = false
}

const handleClickOutside = () => {
  isOpen.value = false
}

// Click outside directive
const vClickOutside = {
  mounted(el: HTMLElement & { clickOutsideEvent?: (event: Event) => void }, binding: { value: () => void }) {
    // Delay adding the listener to avoid immediate triggering
    setTimeout(() => {
      el.clickOutsideEvent = (event: Event) => {
        if (!(el === event.target || el.contains(event.target as Node))) {
          binding.value()
        }
      }
      document.addEventListener('click', el.clickOutsideEvent)
    }, 0)
  },
  unmounted(el: HTMLElement & { clickOutsideEvent?: (event: Event) => void }) {
    if (el.clickOutsideEvent) {
      document.removeEventListener('click', el.clickOutsideEvent)
    }
  }
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
