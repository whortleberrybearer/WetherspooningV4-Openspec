# Project Context

## Purpose
Wetherspooning is a website that displays the locations of Wetherspoons pubs and allows users to track visits to them.

## Tech Stack
- **Frontend:** Vue 3.5, TypeScript 5.9, Vite 7.2, [shadcn/vue](https://www.shadcn-vue.com/), Tailwind CSS 4.0
- **Backend:**

## Project Conventions

### Code Style
- Comments should be minimal and be used to explain why, not what, code does.

### Architecture Patterns
- **Frontend:**
  - Single page app.
  - Follow mobile first design principles.

### Testing Strategy
[Explain your testing approach and requirements]

### Git Workflow
- Use Github Flow
  - Create a feature branch when starting a new change
  - Implement the changes, commit often, e.g. after the completion of each task
  - Create a pull request when feature is complete
- Commit following initial generation of a specification
- Commit messages should be brief
- Use pull request template form .github\PULL_REQUEST_TEMPLATE\pull_request_template.md
- Use Conventional Commits for pull request titles

## Domain Context
- Entities:
  - **Pub:** Id, Name, TownCity, Address, County, Region, Country, Position (Lat, Lng), Url, ImageUrl, OpenState
  - **User:** Id, Username, Email
  - **Visit:** Id, UserId, PubId, VisitedAt (date, optional), Rating (1–5, optional), Notes (optional)

## Important Constraints
[List any technical, business, or regulatory constraints]

## External Dependencies
- **Google Maps JavaScript API:** Requires API key and Map ID (configured via environment variables)
  - Maps JavaScript API for map rendering
  - Advanced Marker API for pub location markers
