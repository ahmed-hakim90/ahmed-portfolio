# Product QA Checklist — Ahmed Portfolio

## Functional and regression

- [ ] Primary journey works with realistic data and permissions.
- [ ] Existing business rules, API contracts, integrations, and side effects are preserved.
- [ ] Loading, empty, error, partial, stale, disabled, read-only, validation, success, and permission states are covered.
- [ ] Shared changes are checked on every known consumer; targeted automated tests pass.

## Visual and responsive

- [ ] Visual QA completed at 320–375, 390–430, tablet, common laptop, and large desktop widths.
- [ ] No unintended overflow, clipping, layout jump, awkward density, or duplicate action.
- [ ] RTL and LTR are structurally correct; icons and direction-sensitive controls are verified.
- [ ] Tokens, spacing, typography, radii, color, elevation, and iconography remain coherent.
- [ ] Result is intentional and product-specific—no generic “AI slop,” decorative clutter, or blind reference cloning.

## Accessibility and performance

- [ ] Semantics, headings, labels, accessible names, keyboard flow, focus visibility, contrast, touch targets, and reduced motion pass review.
- [ ] Bundle/dependency growth is justified; render, query, caching, asset, and interaction performance show no material regression.

## Completion gate

- [ ] Root cause is addressed and evidence is recorded.
- [ ] Durable decisions and component changes are reflected in `docs/`.
- [ ] A real rendered flow was inspected; compiling or linting alone is insufficient.
- [ ] Regression review completed after the staged rollout: Foundation → Shared primitives → Shared patterns → Representative screens → Remaining screens → Responsive/RTL QA → Regression review.
