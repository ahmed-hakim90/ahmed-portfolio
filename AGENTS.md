# Project Agent Rules

These rules apply to the entire repository. Read the relevant files in `docs/` before changing product UI or shared architecture.

- Understand the affected user journey and business constraints before coding; fix root causes, not visible symptoms.
- Reuse and extend existing components, tokens, utilities, validation, and domain logic before creating alternatives.
- Preserve business logic, permissions, data contracts, and integrations unless the task explicitly changes them.
- Keep the product mobile-first and verify both RTL and LTR whenever localization/direction is supported or plausible.
- Do not introduce one-off colors, spacing, radii, shadows, typography, duplicated patterns, or “AI-generated” decorative clutter.
- Cover loading, empty, error, disabled, validation, success, permission, and partial-data states.
- Maintain semantic HTML, keyboard access, visible focus, contrast, accessible names, touch targets, and reduced-motion behavior.
- Check performance implications: bundle growth, render churn, asset weight, query behavior, caching, and unnecessary dependencies.
- Inspect cross-screen impact before modifying shared code. Update permanent decisions in `docs/`.
- Completion requires targeted tests plus visual QA at mobile, tablet, laptop, and desktop sizes. Compilation alone is not proof.
- Do not mass-redesign. Follow the staged plan documented in `docs/PRODUCT.md` and preserve working product behavior.
