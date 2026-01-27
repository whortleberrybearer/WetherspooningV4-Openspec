<template>
  <Dialog :open="isOpen" @update:open="(open) => !open && handleClose()">
    <DialogContent class="sm:max-w-106.25">
      <DialogHeader>
        <DialogTitle>User Not Found</DialogTitle>
        <DialogDescription>
          The user @{{ username }} could not be found
        </DialogDescription>
      </DialogHeader>
      <Button @click="handleClose" class="w-full">
        {{ isAuthenticated ? 'Return to My Visits' : 'OK' }}
      </Button>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

interface Props {
  isOpen: boolean
  username: string
}

defineProps<Props>()

const { isAuthenticated } = useAuth()
const router = useRouter()

const handleClose = () => {
    router.push('/')
}
</script>
