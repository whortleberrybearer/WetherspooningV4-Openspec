# Implementation Tasks

## 1. Update Pub Interface with Postcode Field
- Add optional `postcode?: string` field to `Pub` interface in `firebaseDataService.ts`
- Update JSDoc comments to document the new field
- **Validation**: TypeScript compilation succeeds, no type errors

## 2. Update InfoWindow Styling Structure
- Remove card wrapper HTML from InfoWindow content (conflicts with Google Maps close button)
- Use simpler div-based layout that works with default InfoWindow styling
- Ensure content is properly structured for readability
- **Validation**: InfoWindow opens without layout conflicts, close button is functional

## 3. Add Postcode Display to InfoWindow
- Check if `pub.postcode` is defined before displaying
- Add postcode line between address and town/city in the InfoWindow content
- Use consistent styling with other address lines (muted text)
- **Validation**: Postcode displays when present, no error when missing

## 4. Add Pub Image Display to InfoWindow
- Check if `pub.imageUrl` is defined before displaying
- Add `<img>` element with appropriate styling:
  - Max height: 200px
  - Width: auto (maintain aspect ratio)
  - Rounded corners (matching card design)
  - Object-fit: cover
- Position image near top of InfoWindow for visual impact
- **Validation**: Image displays correctly, respects size constraints

## 5. Add Wetherspoons Image Attribution
- Check if `pub.imageUrl` contains "jdwetherspoon.com"
- If true, add attribution text "Image © JD Wetherspoon" below image
- Style attribution with small font size and muted color
- **Validation**: Attribution appears only for Wetherspoons images

## 6. Add Wetherspoons Website Link
- Check if `pub.url` is defined before displaying
- Add link with text "View on Wetherspoons website"
- Set `target="_blank"` and `rel="noopener noreferrer"` attributes
- Style link to be visually distinct (use primary color, underline on hover)
- Position link after address information
- **Validation**: Link opens in new tab, navigates to correct URL

## 7. Manual Testing
- Test InfoWindow with all optional fields present
- Test InfoWindow with all optional fields missing
- Test InfoWindow with mixed field availability
- Test attribution appears only for Wetherspoons images
- Test link opens in new tab
- Test image size constraints with various image sizes
- Test close button functionality
- Test on mobile devices for responsive layout
- **Validation**: All scenarios work as expected, no visual bugs

## Task Dependencies
- Task 2 must complete before tasks 3-6 (need working layout first)
- Tasks 3-6 can be implemented in parallel after task 2
- Task 7 requires all previous tasks to complete

## Estimated Effort
- Task 1: 5 minutes
- Task 2: 15 minutes
- Task 3: 5 minutes
- Task 4: 10 minutes
- Task 5: 5 minutes
- Task 6: 5 minutes
- Task 7: 20 minutes
- **Total**: ~65 minutes
