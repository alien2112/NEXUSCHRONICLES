# Code-quality audit fixes

These changes follow the read-only audit and the user's subsequent request to fix its findings. They intentionally correct interaction and state defects; the earlier `refactoring-report.md` describes the separate, historical preservation-only refactor.

## Changes

| Audit finding | Resolution |
| --- | --- |
| B1–B2: Keyboard access and conflicting shortcuts | Added keyboard activation for evidence placement, waveform selection, dialogue progression, mission pins and world selection. Step navigation and home navigation use buttons. Scene shortcuts defer to focused controls, handled events, modifier keys and open dialogs. Waveform keyboard selection no longer depends on pointer coordinates. |
| B3: False completion | Earned stamp IDs replace the highest-step count. Jumping to later steps remains allowed but awards nothing. Step checkmarks and the case-board overlay use actual earned IDs. Replay clears the investigation's confidence, codename and earned evidence. |
| B4: Repeatable tests | Added Node unit tests and a Playwright development dependency with desktop/mobile browser checks. The preview server is owned and closed in-process, avoiding Windows process-tree teardown issues. |
| B5: Modal behavior | Added a shared native dialog wrapper with an accessible name, background isolation, focus containment, Escape dismissal, scroll locking and focus restoration. Applied it to existing modal overlays; inline reference panels remain inline. |
| B6: Accessible state | Added visible keyboard focus, selection state for trust/clue/spectrum controls, associated input labels and canvas descriptions. Custom sliders expose focus through their visible container. |
| B7: Unavailable navigation | Search/Menu and unfinished top-level actions remain unavailable and are explicitly disabled. Closed search no longer consumes Ctrl/Cmd+K. The existing dropdown toggle is independently keyboard-operable. |
| B8: Hash behavior | Centralized every existing alias and canonical hash. Unknown hashes consistently render Home before and after refresh. Valid aliases and hierarchy-based Back destinations are preserved. |
| B9: Audio lifecycle | Extracted synthesis into an owned audio hook. It handles rejected resume promises, ignores obsolete asynchronous requests, stops/disconnects nodes, closes contexts on unmount and reports unavailable audio. Synthesis parameters remain unchanged. |
| B10: Confidence display | The live percentage and label derive from the same slider value. Shared confidence commits remain separate. |
| B11: Initial JavaScript | Lazy-loaded the investigation, including its workspaces and confetti. Added loading and page-error states. |
| B12: Image loading | Six large backgrounds use lossless WebP delivery copies. Original PNGs remain intact. Full-resolution copies preserve the original artwork rather than introducing resized or lossy variants. |
| B13: Motion preferences | Reduced-motion CSS shortens animations/transitions; navigation avoids smooth scrolling and confetti honors the preference. |
| B14: Unsupported utility classes | Removed undefined animation utility names instead of adding new effects. Existing implemented animations remain. |

Optional architectural suggestions were not treated as requirements to migrate frameworks, adopt a routing/state library, rewrite content, or implement future experiences. No Engineering Legacy functionality was added and nothing was deployed.

## Files

- Application/navigation: `src/App.jsx`, `src/data/routes.js`, `src/hooks/useHashNavigation.js`, `src/components/navigation/{Navbar,SearchModal,DrawerMenu}.jsx`.
- Shared behavior: `src/components/{Modal,PageBoundary,EquipmentModal}.jsx`, `src/utils/keyboard.js`, `src/index.css`.
- Investigation: `src/pages/InvestigationPage.jsx`, `src/hooks/useInvestigationAudio.js`, `src/features/investigation/progress.js`, and the existing case board, trust meter, shared workspace layout and four workspaces.
- Pages: existing pages updated for modal wrappers, keyboard behavior, unsupported animation-class removal or background delivery URLs.
- Assets: six `.webp` siblings of the original large PNG backgrounds in `public/`.
- Tests/tooling: `tests/unit/navigation.test.js`, `tests/browser/regressions.spec.js`, `tests/start-preview.js`, `playwright.config.js`, `package.json`, `package-lock.json`, `.gitignore`.
- Documentation: `README.md` and this report.

## Validation

- Production build passed; lint passed without warnings.
- Three Node unit tests passed: aliases/fallbacks, independent earned stamps and shortcut exclusion.
- Twenty browser tests passed across desktop (1440 × 900) and mobile (390 × 844). Coverage includes keyboard confidence/waveform/dialogue/verdict operation, independent Test 3 earning, modal focus/Escape/restoration, the main journey and parent Back destinations, unknown hashes/reload/history, unavailable navigation, reduced motion, audio cleanup/rejection and page/resource loading.
- Audio lifecycle tests use a controlled Web Audio substitute to verify cleanup and rejected promises deterministically; they do not evaluate audible output.
- Tests use locally installed Chrome through `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. They also work with Playwright's installed Chromium when that variable is omitted.
- External font requests are replaced with empty CSS during browser checks to keep them network-independent. Production font URLs remain unchanged.
- Background conversion checked decoded RGBA pixels. Visible pixels and alpha are unchanged; RGB values underneath fully transparent pixels are ignored because they do not contribute to the displayed image.
- Original background sizes total 13,441,451 bytes; WebP copies total 9,945,318 bytes, a reduction of approximately 26% across those six files. This is aggregate asset size, not a claim that every page downloads all six.
- The initial JavaScript entry decreased from 414,552 bytes to approximately 314,510 bytes (about 24%). Investigation code is delivered as a separate approximately 105 KB chunk. Total JavaScript is slightly larger because of the fixes and accessibility behavior.

The work does not claim exhaustive accessibility certification or scientific validation. Smaller responsive artwork variants, further component decomposition and persistence/revisit policy remain optional follow-up decisions. Local before/after screenshots are retained under `%TEMP%/nexus-audit-fix-visuals/`; source/build backups are under `%TEMP%/nexus-before-audit-fixes-20261114/`.
