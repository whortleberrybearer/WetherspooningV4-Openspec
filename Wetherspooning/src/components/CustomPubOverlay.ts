import type { Pub } from '@/services/firebaseDataService'

interface CustomPubOverlayOptions {
  onClose: () => void
  onTrackVisit: (pub: Pub) => void
  onSignIn: () => void
  isAuthenticated: () => boolean
  getVisit: (pubId: string) => { visitedAt?: string | null; rating?: number | null; notes?: string | null } | null | undefined
  isVisited: (pubId: string) => boolean
}

export interface CustomPubOverlay extends google.maps.OverlayView {
  show(pub: Pub, position: google.maps.LatLng, isDark: boolean): void
  hide(): void
  update(pub: Pub, isDark: boolean): void
}

export function createCustomPubOverlay(options: CustomPubOverlayOptions): CustomPubOverlay {
  class CustomPubOverlayImpl extends google.maps.OverlayView implements CustomPubOverlay {
  private position: google.maps.LatLng | null = null
  private container: HTMLDivElement | null = null
  private pub: Pub | null = null
  private isDark = false
  private onClose: () => void
  private onTrackVisit: (pub: Pub) => void
  private onSignIn: () => void
  private isAuthenticated: () => boolean
  private getVisit: (pubId: string) => { visitedAt?: string | null; rating?: number | null; notes?: string | null } | null | undefined
  private isVisited: (pubId: string) => boolean
  private escKeyHandler: ((e: KeyboardEvent) => void) | null = null
  private closeButtonHandler: (() => void) | null = null
  private actionButtonHandler: (() => void) | null = null
  private needsReposition = false

  constructor() {
    super()
    this.onClose = options.onClose
    this.onTrackVisit = options.onTrackVisit
    this.onSignIn = options.onSignIn
    this.isAuthenticated = options.isAuthenticated
    this.getVisit = options.getVisit
    this.isVisited = options.isVisited
  }

  onAdd(): void {
    this.container = document.createElement('div')
    this.container.style.position = 'absolute'
    this.container.style.zIndex = '1000'
    this.container.style.display = 'none'
    this.container.setAttribute('role', 'dialog')

    const panes = this.getPanes()
    if (panes) {
      panes.floatPane.appendChild(this.container)
    }
  }

  draw(): void {
    if (!this.container || !this.position || !this.needsReposition) return

    const projection = this.getProjection()
    if (!projection) return

    const point = projection.fromLatLngToDivPixel(this.position)
    if (!point) return

    // Calculate overlay dimensions
    const overlayWidth = this.container.offsetWidth
    const overlayHeight = this.container.offsetHeight

    // Position overlay centered horizontally and above the marker
    let left = point.x - overlayWidth / 2
    let top = point.y - overlayHeight - 40 // 40px gap above marker (includes marker height)

    // Viewport boundary checks
    const map = this.getMap()
    if (map instanceof google.maps.Map) {
      const mapDiv = map.getDiv()
      const mapWidth = mapDiv.offsetWidth
      const mapHeight = mapDiv.offsetHeight
      const margin = 10

      // Prevent overflow on left
      if (left < margin) left = margin

      // Prevent overflow on right
      if (left + overlayWidth > mapWidth - margin) {
        left = mapWidth - overlayWidth - margin
      }

      // Prevent overflow on top
      if (top < margin) top = margin

      // Prevent overflow on bottom
      if (top + overlayHeight > mapHeight - margin) {
        top = mapHeight - overlayHeight - margin
      }
    }

    this.container.style.left = `${left}px`
    this.container.style.top = `${top}px`
    
    // Reset flag after positioning
    this.needsReposition = false
  }

  onRemove(): void {
    this.cleanupEventListeners()
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
    this.container = null
  }

  show(pub: Pub, position: google.maps.LatLng, isDark: boolean): void {
    this.pub = pub
    this.position = position
    this.isDark = isDark
    this.needsReposition = true

    if (this.container) {
      // Set visibility first so dimensions can be calculated
      this.container.style.visibility = 'hidden'
      this.container.style.display = 'block'
      
      this.container.innerHTML = this.generateContent(pub, isDark)
      this.container.setAttribute('aria-label', `Pub information for ${pub.name}`)
      this.attachEventListeners()
      
      // Force a layout calculation
      this.container.offsetHeight
      
      // Now position and make visible
      this.draw()
      this.container.style.visibility = 'visible'

      // Move focus to close button
      setTimeout(() => {
        const closeBtn = this.container?.querySelector('.custom-overlay-close') as HTMLElement
        closeBtn?.focus()
      }, 100)
    }
  }

  hide(): void {
    this.cleanupEventListeners()
    if (this.container) {
      this.container.style.display = 'none'
      this.container.innerHTML = ''
    }
    this.pub = null
  }

  update(pub: Pub, isDark: boolean): void {
    this.pub = pub
    this.isDark = isDark

    if (this.container) {
      this.cleanupEventListeners()
      this.container.innerHTML = this.generateContent(pub, isDark)
      this.attachEventListeners()
      // Don't reposition - content update doesn't require repositioning
    }
  }

  private generateContent(pub: Pub, isDark: boolean): string {
    const openState = pub.openState || 'Open'
    const visited = this.isVisited(pub.id)

    // Theme-aware colors
    const bgColor = isDark ? '#1c1917' : '#ffffff'
    const textColor = isDark ? '#fafaf9' : '#1f2937'
    const mutedColor = isDark ? '#a8a29e' : '#6b7280'
    const buttonBg = isDark ? '#fafaf9' : '#0f172a'
    const buttonTextColor = isDark ? '#1c1917' : '#f8fafc'
    const buttonHoverBg = isDark ? '#e7e5e4' : '#1e293b'
    const linkColor = isDark ? '#a1a1aa' : 'hsl(var(--primary))'
    const closeBtnColor = isDark ? '#fafaf9' : '#1f2937'

    // Image section with conditional attribution
    let imageHtml = ''
    if (pub.imageUrl) {
      const attribution = pub.imageUrl.includes('jdwetherspoon.com')
        ? `<p style="font-size: 10px; color: ${mutedColor}; margin: 4px 0 0 0;">Image © JD Wetherspoon</p>`
        : ''
      imageHtml = `
        <div style="margin-bottom: 12px;">
          <img src="${pub.imageUrl}" alt="${pub.name}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;" />
          ${attribution}
        </div>
      `
    }

    // Status badge with color coding
    let statusBadge = ''
    let badgeColor = '#22c55e' // green for Open
    let badgeText = openState

    if (openState === 'Closed') {
      badgeColor = '#ef4444' // red
    } else if (openState === 'Temporary Closed') {
      badgeColor = '#f97316' // orange
    } else if (openState.startsWith('Opening')) {
      badgeColor = '#f97316' // orange
    } else if (openState.startsWith('Reopening')) {
      badgeColor = '#f97316' // orange
    }

    if (openState !== 'Open') {
      statusBadge = `<span style="display: inline-flex; align-items: center; border-radius: 6px; border: 1px solid transparent; padding: 2px 10px; font-size: 12px; font-weight: 600; background-color: ${badgeColor}; color: white;">${badgeText}</span>`
    }

    // Location type badge
    let locationBadge = ''
    if (pub.isHotel) {
      locationBadge = `<span style="display: inline-flex; align-items: center; gap: 4px; border-radius: 6px; border: 1px solid transparent; padding: 2px 10px; font-size: 12px; font-weight: 600; background-color: #f59e0b; color: white;">🏨 Hotel</span>`
    } else if (pub.inAirport) {
      locationBadge = `<span style="display: inline-flex; align-items: center; gap: 4px; border-radius: 6px; border: 1px solid transparent; padding: 2px 10px; font-size: 12px; font-weight: 600; background-color: #3b82f6; color: white;">✈️ Airport</span>`
    } else if (pub.inTrainStation) {
      locationBadge = `<span style="display: inline-flex; align-items: center; gap: 4px; border-radius: 6px; border: 1px solid transparent; padding: 2px 10px; font-size: 12px; font-weight: 600; background-color: #8b5cf6; color: white;">🚂 Train Station</span>`
    }

    // Visit badge with formatted date
    let visitBadge = ''
    let ratingDisplay = ''
    let notesPreview = ''
    if (this.isAuthenticated() && visited) {
      const visit = this.getVisit(pub.id)
      const visitDate = visit?.visitedAt
      let formattedDate = ''
      if (visitDate) {
        try {
          const date = new Date(visitDate)
          formattedDate =
            ' ' +
            date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit'
            })
        } catch (error) {
          console.error('Error formatting visit date:', error)
        }
      }

      visitBadge = `<span style="display: inline-flex; align-items: center; border-radius: 6px; border: 1px solid transparent; padding: 2px 10px; font-size: 12px; font-weight: 600; background-color: #22c55e; color: white;">✓ Visited${formattedDate}</span>`

      // Display rating stars inline with the pub name
      if (visit?.rating) {
        const filled = '★'.repeat(visit.rating)
        const empty = '☆'.repeat(5 - visit.rating)
        ratingDisplay = `<span style="font-size: 16px; color: #fbbf24; margin-left: 8px;">${filled}${empty}</span>`
      }

      // Add notes preview if notes exist
      if (visit?.notes && visit.notes.trim()) {
        const truncatedNotes = visit.notes.length > 100 ? visit.notes.substring(0, 100) + '...' : visit.notes
        notesPreview = `
          <div style="background-color: ${isDark ? '#292524' : '#f5f5f4'}; border: 1px solid ${isDark ? '#44403c' : '#e7e5e4'}; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; font-size: 12px; color: ${mutedColor};">
            ${truncatedNotes}
          </div>
        `
      }
    }

    // Website link
    let websiteLink = ''
    if (pub.url) {
      websiteLink = `<a href="${pub.url}" target="_blank" rel="noopener noreferrer" style="font-size: 14px; color: ${linkColor}; text-decoration: none; display: block; margin-bottom: 12px;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">View on Wetherspoons website</a>`
    }

    // Button text based on authentication state
    let buttonText = ''
    if (this.isAuthenticated()) {
      buttonText = visited ? 'Update Visit' : 'Visit'
    } else {
      buttonText = 'Sign in to track visit'
    }

    return `
      <style>
        .custom-overlay-card {
          position: relative;
          width: 400px;
          max-width: calc(100vw - 20px);
          padding: 16px;
          background: ${bgColor};
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        @media (max-width: 450px) {
          .custom-overlay-card {
            width: 320px;
          }
        }
        
        @media (max-width: 350px) {
          .custom-overlay-card {
            width: 280px;
          }
        }
        
        .custom-overlay-close {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${isDark ? '#292524' : '#ffffff'};
          border: 1px solid ${isDark ? '#44403c' : '#e5e7eb'};
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          color: ${closeBtnColor};
          font-size: 18px;
          line-height: 1;
          padding: 0;
        }
        
        .custom-overlay-close:hover {
          background: ${isDark ? '#3c3836' : '#f3f4f6'};
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .custom-overlay-close:focus {
          outline: 2px solid ${linkColor};
          outline-offset: 2px;
        }
        
        .custom-overlay-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: ${textColor};
          padding-right: 32px;
        }
        
        .custom-overlay-badges {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        
        .custom-overlay-address {
          font-size: 14px;
          color: ${mutedColor};
          margin: 0 0 12px 0;
          line-height: 1.5;
        }
        
        .custom-overlay-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          background-color: ${buttonBg};
          color: ${buttonTextColor};
          height: 44px;
          padding: 0 16px;
          width: 100%;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .custom-overlay-button:hover {
          background-color: ${buttonHoverBg};
        }
        
        .custom-overlay-button:focus {
          outline: 2px solid ${linkColor};
          outline-offset: 2px;
        }
      </style>
      <div class="custom-overlay-card">
        <button class="custom-overlay-close" aria-label="Close">×</button>
        ${imageHtml}
        <h3 class="custom-overlay-title">${pub.name}${ratingDisplay}</h3>
        <div class="custom-overlay-badges">
          ${visitBadge}
          ${statusBadge}
          ${locationBadge}
        </div>
        <p class="custom-overlay-address">${pub.address}</p>
        ${websiteLink}
        ${notesPreview}
        <button class="custom-overlay-button">
          ${buttonText}
        </button>
      </div>
    `
  }

  private attachEventListeners(): void {
    if (!this.container) return

    // Close button
    const closeBtn = this.container.querySelector('.custom-overlay-close') as HTMLElement
    if (closeBtn) {
      this.closeButtonHandler = () => this.onClose()
      closeBtn.addEventListener('click', this.closeButtonHandler)
    }

    // Action button
    const actionBtn = this.container.querySelector('.custom-overlay-button') as HTMLElement
    if (actionBtn) {
      this.actionButtonHandler = () => {
        if (this.pub) {
          if (this.isAuthenticated()) {
            this.onTrackVisit(this.pub)
          } else {
            this.onSignIn()
          }
        }
      }
      actionBtn.addEventListener('click', this.actionButtonHandler)
    }

    // ESC key handler
    this.escKeyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.onClose()
      }
    }
    document.addEventListener('keydown', this.escKeyHandler)
  }

  private cleanupEventListeners(): void {
    if (!this.container) return

    // Remove close button listener
    const closeBtn = this.container.querySelector('.custom-overlay-close') as HTMLElement
    if (closeBtn && this.closeButtonHandler) {
      closeBtn.removeEventListener('click', this.closeButtonHandler)
      this.closeButtonHandler = null
    }

    // Remove action button listener
    const actionBtn = this.container.querySelector('.custom-overlay-button') as HTMLElement
    if (actionBtn && this.actionButtonHandler) {
      actionBtn.removeEventListener('click', this.actionButtonHandler)
      this.actionButtonHandler = null
    }

    // Remove ESC key listener
    if (this.escKeyHandler) {
      document.removeEventListener('keydown', this.escKeyHandler)
      this.escKeyHandler = null
    }
  }
}

  return new CustomPubOverlayImpl() as CustomPubOverlay
}
