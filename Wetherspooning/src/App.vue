<script setup lang="ts">
import { SidebarProvider } from '@/components/ui/sidebar'
</script>

<template>
  <SidebarProvider>
    <RouterView />
  </SidebarProvider>
</template>

<style scoped></style>
