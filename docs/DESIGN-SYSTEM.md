# Design System — Ahmed Portfolio

## Current direction

Use the existing visual identity as evidence, then converge on a modern, premium, minimal, calm language appropriate to a content/marketing experience. Avoid generic admin-template styling, excessive cards, gradients, shadows, radii, oversized type, and arbitrary decoration.

## Foundation

- Define semantic tokens for background, surface, foreground, muted, border, primary, info, success, warning, and destructive.
- Use an intentional spacing rhythm (prefer 4/8/12/16/20/24/32/40/48/64), compact type roles, shared radii, elevations, motion, breakpoints, containers, and z-index.
- Keep Arabic typography and shaping professional. Use CSS logical properties so RTL is structural; do not patch direction with scattered overrides.
- New values must enter the system or reuse an existing token. Document justified exceptions.

## Responsive and interaction rules

Start at 320–375px, then validate 390–430px, tablet, common laptop, and large desktop. Preserve readable density, ≥44px touch targets where practical, visible focus, adequate contrast, keyboard navigation, reduced motion, and stable layouts during loading.

## Governance

Reuse before create. A new variant requires a real semantic need and cross-page review. References provide hierarchy, spacing, density, and interaction evidence—not permission for blind cloning.
