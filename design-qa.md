# Funnel alpha — visual QA

final result: passed

Source: C:/Users/ninch/AppData/Local/Temp/codex-clipboard-0a97fbb6-c33d-438a-b7dc-0bfb53e722d0.png (1505 × 1045).
Implementation: output/funnel/desktop.jpg. Additional evidence: output/funnel/mobile-copy.jpg, output/funnel/mobile-diagram.jpg, output/funnel/english.jpg.
Route: http://localhost:3000/?lang=es#funnel
Branch: alpha. Main and the feature flag were not modified.

Comparison viewport: 1505 × 1045 CSS pixels. Browser capture 1490 × 1035 physical pixels; content compared at native preview scale, accounting for the browser scrollbar/capture sizing and unchanged sticky site header. Both source and latest rendered desktop image were viewed together in the same comparison tool input. Mobile checked at 390 × 844 CSS pixels. Same ivory theme, Spanish copy, full section state.

Comparison history:
- First desktop capture: bottom branch connector was masked by output heading, P2. Fixed heading padding and vertical position, then recaptured at the same viewport. Full bracket and all three output endpoints now visible.
- Left stage descriptions were too wide versus the source. Constrained first and second description line lengths; layout now has the intended two-line descriptions and aligned stage numbers.
- Final comparison: no actionable P0/P1/P2 findings. P3 differences: generated routing curves and very faint concentric rings differ slightly; icon glyph shapes differ from the generated mockup. Existing site header retained. No focused crop needed because the full section comparison clearly exposes all labels/connectors.

Functionality: stage button selection verified via aria-pressed; automatic stage progression uses an IntersectionObserver and respects reduced-motion changes. All core copy stays visible even when motion is disabled. English copy inspected without overflow; only assistance and claims remain in both languages. On mobile the copy and steps stack before the diagram, all outputs stay readable, and document width does not exceed viewport. Temporary viewport override reset.

Validation: VERCEL=1 npm run build passed; eslint for changed TSX/content passed; git diff --check passed. Console inspected: one MutationObserver exception was logged by the surrounding page/runtime; no MutationObserver exists in app or insurer demo source, and no error was attributed to the funnel component. This report does not claim a clean global console.

Repository-wide page lint also inspected: pre-existing carousel accessibility errors at app/page.tsx:708 and two warnings remain outside this change. The page caller was left unchanged; language is supplied by the intake copy.


## Scroll transitions update

The timer-based highlight is replaced by scroll progress. Inputs fade/slide in first; the existing routing image is revealed vertically; the Weso hub scales into place; the outcome heading and three results follow in order. Transitions reverse on upward scroll. Stage buttons scroll to their corresponding part of the diagram. Reduced-motion disables transforms and clipping and exposes all content; the preference listener updates live. Scroll updates are coalesced into a single requestAnimationFrame; listeners and ResizeObserver are cleaned up.

Browser checks: downward scroll advanced --funnel-route from 0.766 to 1 and the final result reveal from 0.003 to 1; upward scroll restored the earlier values. Clicking the third stage selected funnel-stage-2 and scrolled to the outputs. Evidence: output/funnel/scroll-transitions.jpg. Original approved composition remains unchanged when fully revealed. Build and component lint passed after this update.

final result: passed


## Pinned scroll update

Desktop scene now pins for a 280svh section; animation progress is based on distance through the section rather than changing element positions. The content scales down only as needed to fit under the existing header. Stage buttons target the pinned timeline. Mobile/short viewports keep natural scrolling, and reduced-motion skips pinning entirely.

Browser evidence: .funnel-pin stayed at top=0 while --funnel-route advanced from 0.566 to 0.785. At the final stage route=1 and last output reveal=1; additional scrolling released the scene (top=-366px). All text and results fit within the viewport. Final screenshot: output/funnel/pinned-scroll.jpg. A blend seam introduced by the scaled stacking context was fixed by isolating the diagram against the page surface and recaptured. Component lint and production build passed.

final result: passed


## Claims chat and iPhone shell

Reference: C:/Users/ninch/AppData/Local/Temp/codex-clipboard-4913c35f-10b8-4eb1-bc3b-9da35ba35c5f.jpg. User then requested realistic iPhone hardware. Scope is the embedded phone, not surrounding page redesign. The phone preserves a live DOM conversation and the existing scroll-driven claim-file sequence.

Implemented insurer-branded purple/fuchsia header fading into white, open assistant replies, pale user bubbles, avatars, timestamps, location/photo attachment summaries and composer styling. Conversation follows accident notice → safety question → location/photos → assistance check → explicitly preliminary assessment → tow dispatch → case reference and updates. Both EN and ES updated. No fake photo/map placeholder drawings remain in the chat. Visible messages are limited to the current step, and the thread scrolls to the latest addition. Phone time matches the latest displayed message.

The device now has 393:852 proportions, a subtle metallic rim, side buttons, Dynamic Island with camera, status icons and home indicator. At the default desktop viewport it measures 323 × 700 CSS pixels; mobile tested at 390 × 844, phone 319 × 692 with no screen/document horizontal overflow. Existing desktop sticky sequence remains functional; at final step all five record fields populate and the thread reaches its scroll end. Final evidence: output/funnel/claims/iphone-detail.jpg, iphone-mobile.jpg, iphone-desktop.jpg. The source chat screenshot and browser view were inspected; a crop attempt initially produced a blank area and was replaced using document coordinates. Header identity layout was corrected after moving the header into device chrome. No actionable P0/P1/P2 issues remain. OS chrome intentionally added per user request; original reference is a screen capture, while final deliverable includes hardware.

Validation: production build, claims/content eslint and diff whitespace checks passed. No changes to main or publishing.

final result: passed
