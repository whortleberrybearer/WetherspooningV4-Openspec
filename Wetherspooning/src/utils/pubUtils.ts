import type { Pub } from '@/services/firebaseDataService'

/**
 * Checks if a pub is closed based on its openState property.
 * 
 * @param pub - The pub to check
 * @returns true if the pub's openState is 'Closed', false otherwise
 */
export function isPubClosed(pub: Pub): boolean {
  const state = pub.openState || 'Open'
  return state === 'Closed'
}
