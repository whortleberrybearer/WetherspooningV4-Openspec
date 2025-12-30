# Implementation Tasks

## 1. Update InfoWindow Styling Structure
- Remove card wrapper HTML from InfoWindow content (conflicts with Google Maps close button)
- Use simpler div-based layout that works with default InfoWindow styling
- Ensure content is properly structured for readability
- **Validation**: InfoWindow opens without layout conflicts, close button is functional

## 2. Update Address Display to Parse and Format Components
- Split `pub.address` on commas to extract address components
- Display each component on a separate line:
  - Line 1: Street address
  - Line 2: Town
  - Line 3: County  
  - Line 4: Postcode
- Handle addresses with fewer than 4 parts gracefully (no errors)
- Use consistent muted text styling for all address lines
- **Validation**: Address displays correctly across multiple lines, parsing handles various formats

## 3. Add Pub Image Display to InfoWindow
- Check if `pub.imageUrl` is defined before displaying
- Add `<img>` element with appropriate styling:
  - Max height: 200px
  - Width: auto (maintain aspect ratio)
  - Rounded corners (matching card design)
  - Object-fit: cover
- Position image near top of InfoWindow for visual impact
- **Validation**: Image displays correctly, respects size constraints

## 4. Add Wetherspoons Image Attribution
- Check if `pub.imageUrl` contains "jdwetherspoon.com"
- If true, add attribution text "Image © JD Wetherspoon" below image
- Style attribution with small font size and muted color
- **Validation**: Attribution appears only for Wetherspoons images

## 5. Add Wetherspoons Website Link
- Check if `pub.url` is defined before displaying
- Add link with text "View on Wetherspoons website"
- Set `target="_blank"` and `rel="noopener noreferrer"` attributes
- Style link to be visually distinct (use primary color, underline on hover)
- Position link after address information
- **Validation**: Link opens in new tab, navigates to correct URL

## 6. Manual Testing
- Test InfoWindow with full address format
- Test InfoWindow with all optional fields present
- Test InfoWindow with all optional fields missing
- Test attribution appears only for Wetherspoons images
- Test link opens in new tab
- Test image size constraints with various image sizes
- Test close button functionality
- Test address wrapping on mobile devices for responsive layout
- **Validation**: All scenarios work as expected, no visual bugs

## Task Dependencies
- Task 1 must complete before tasks 2-5 (need working layout first)
- Tasks 2-5 can be implemented in parallel after task 1
- Task 6 requires all previous tasks to complete

## Estimated Effort
- Task 1: 15 minutes
- Task 2: 10 minutes
- Task 3: 10 minutes
- Task 4: 5 minutes
- Task 5: 5 minutes
- Task 6: 20 minutes
- **Total**: ~65 minutes
