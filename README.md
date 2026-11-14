# NexusChronicles

**The mission ends. The evidence remains.**

AFTERTRACE is an early, frontend-only NASA Space Apps concept about the evidence that space missions leave behind. Its product direction comes from the user-supplied sketches, AI visual reference, and **Project Vision & Execution Blueprint**. This repository contains the existing NEXUS CHRONICLES frontend, organized as a foundation for that vision.

## Project vision

The intended learning journey takes a learner from the Moon and Mars into an InSight mission story, through evidence exploration and interpretation, and toward science and engineering follow-up. The aim is to connect mission storytelling with the process of asking questions, examining observations, weighing evidence, and explaining a conclusion.

InSight is the flagship mission. The broader concept includes world exploration, mission stories, evidence-based investigation, and opportunities to reflect on the science and engineering behind a mission. Preview missions should remain clearly distinguished from complete learning experiences.

This is an early development foundation, not a completed or scientifically validated learning activity. Scientific explanations, evidence provenance, interpretations, and learning outcomes need editorial and scientific review before the experience is presented as validated educational material. New editorial content should come from team-authored, reviewed material; unfinished content should be identified clearly when implemented.

## Current implementation and scope

The current frontend includes a landing page, Moon/Mars selection, a Mars overview and mission map, InSight introduction and story pages, and the existing Case 1094 investigation. That investigation includes seismogram interactions, crater comparison, scale and speed exploration, ice-spectrum matching, confidence controls, and a case board.

The broader science and engineering follow-up is product vision, not a claim that every proposed experience is implemented here. **The Engineering Legacy game has not been implemented and is outside the current refactoring scope.**

The supplied AFTERTRACE README also describes a TypeScript/Three.js MVP with GLB models, asset-download scripts, session persistence, and GitHub workflows. Those capabilities are not present in this repository and are not listed here as working features or commands. This implementation uses existing images and canvas visuals; it does not bundle the described 3D model pipeline.

## Stack

| Layer | Current implementation |
| --- | --- |
| UI | React 19 with JavaScript / JSX |
| Build / development | Vite 8 |
| Styling | Tailwind CSS 4 and existing global CSS |
| Icons | Lucide React |
| Investigation visuals | Existing images, Canvas 2D, and canvas-confetti |
| Navigation | URL hashes and React state |
| State | React hooks |
| Validation commands | Vite build, Oxlint, Node unit tests, and Playwright browser regressions |

There is no backend, routing library, account system, database, or submission service in this repository. No API keys or environment variables are needed to run the current frontend.

## Development

```sh
npm ci
npm run dev
npm run build
npm run lint
npm run preview
```

The production build is written to `dist/`. Existing Vite configuration and deployment behavior are unchanged. Run `npm test` for unit tests and desktop/mobile browser regressions (including a production build). Run `npm run test:unit` or `npm run test:browser` independently. Install Chromium once with `npx playwright install chromium`; alternatively set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an installed Chromium/Chrome executable. The test harness starts and closes its own local preview server on port 4173.

## Source structure

```text
src/
  main.jsx                      React entry point and global stylesheet import
  App.jsx                       Page composition and persistent overlay state
  index.css                     Existing global styles, fonts, and animations
  pages/                        Home, world selection, Mars, InSight, investigation
  components/
    navigation/                 Navbar, search modal, drawer
    NasaLogo.jsx                Shared NASA logo
    EquipmentModal.jsx          Existing equipment presentation component
  features/
    investigation/              Existing investigation workspaces and case board
  hooks/
    useHashNavigation.js        Existing hash synchronization and navigation
  data/                         Navigation content, equipment content, mission pins
  assets/                       Preserved source assets
public/                         Preserved assets served at their existing URLs
```

Individual pages retain their original local state. The investigation page owns scene progression, audio, confidence, and unlocked stamps; the four workspace modules retain their own interaction state. `WorkspaceLayout.jsx` contains their shared HUD and dialogue components.

## Navigation

| Page | Accepted hashes |
| --- | --- |
| Home | empty hash, `#home`, `#explore` |
| World selection | `#missions`, `#choose-world`, `#worlds`, `#page2` |
| Mars | `#mars`, `#the-mars`, `#page3` |
| Mars missions | `#mars-missions`, `#mars-page4`, `#page4` |
| InSight overview | `#mars-insight`, `#insight`, `#page5` |
| InSight mission | `#insight-mission`, `#page6` |
| Story 1 | `#insight-story-1`, `#story-1`, `#story1`, `#page7` |
| Investigation | `#investigation`, `#investigate`, `#case-1094`, `#page8` |
| Case Board | `#case-board`, `#investigation-case-board` |
| Go deeper (1–6) | `#go-deeper` (`#go-deeper-1`, `#science-behind-it`, `#science-behind-it-1`), `#go-deeper-2`..`#go-deeper-6` (`#science-behind-it-2`..`#science-behind-it-6`) |
| Go technical (1–10) | `#go-technical` (`#go-technical-1`, `#engineering-the-mission`, `#engineering-the-mission-1`), `#go-technical-2`..`#go-technical-10` (`#engineering-the-mission-2`..`#engineering-the-mission-10`) |

Hash matching is case-insensitive. Unknown hashes consistently render Home, including on refresh. Navigation callbacks retain existing canonical hashes and hierarchy-based Back destinations. Scrolling respects reduced-motion preferences.

## Maintenance

Keep public asset URLs, content, styling, state ownership, and navigation behavior intact when reorganizing modules. The existing equipment component and data are retained even though the current page flow does not import them. Global CSS remains together to preserve its cascade and Tailwind output.

See [the refactoring report](docs/refactoring-report.md) for the file inventory and validation results. This refactor adds no Engineering Legacy implementation and does not deploy the site

## Audit fixes

See [audit fixes and validation](docs/audit-fixes.md) for keyboard, modal, evidence-state, routing, audio, and loading fixes. The earlier refactoring report records the historical preservation baseline; these subsequent fixes intentionally correct the behavior identified by the audit. Original PNG assets are retained alongside lossless WebP delivery copies.
