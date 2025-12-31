<template>
    <Card v-if="isOpen && pub" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 shadow-lg w-[calc(100%-2rem)] max-w-md">
      <CardHeader>
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <CardTitle class="text-lg">{{ pub.name }}</CardTitle>
            <CardDescription class="mt-1 text-sm">
              {{ pub.address }}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 shrink-0"
            @click="$emit('dismiss')"
            aria-label="Close"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent v-if="pub.imageUrl" class="pb-3">
        <img
          :src="pub.imageUrl"
          :alt="pub.name"
          class="w-full h-48 object-cover rounded-md"
        />
        <p v-if="pub.imageUrl.includes('jdwetherspoon.com')" class="text-xs text-muted-foreground mt-1">
          Image © JD Wetherspoon
        </p>
      </CardContent>
      
      <CardFooter class="flex-col gap-2">
        <Button
          v-if="isAuthenticated"
          class="w-full"
          @click="$emit('confirm')"
        >
          Visit
        </Button>
        <Button
          v-else
          variant="outline"
          class="w-full"
          @click="$emit('signIn')"
        >
          Sign in to track visit
        </Button>
      </CardFooter>
    </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-vue-next'
import type { Pub } from '@/services/firebaseDataService'

defineProps<{
  pub: Pub | null
  isOpen: boolean
  isAuthenticated: boolean
}>()

defineEmits<{
  confirm: []
  dismiss: []
  signIn: []
}>()
</script>
