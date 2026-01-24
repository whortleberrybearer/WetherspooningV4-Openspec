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

/**
 * Format ISO date string to DD/MM/YY format
 * 
 * @param isoDate - ISO date string to format
 * @returns Formatted date string or null if invalid
 */
export function formatVisitDate(isoDate: string | null | undefined): string | null {
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
