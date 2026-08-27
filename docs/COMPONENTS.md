# Component Strategy — Ahmed Portfolio

Detected stack: **Next.js/React and Tailwind CSS**.

## Reuse hierarchy

1. Existing stable project component
2. Existing primitive extended with a semantic variant
3. Composition of existing primitives
4. New shared primitive or pattern only after repository-wide search
5. Page-local component only when it is genuinely single-use

## Shared primitives to inventory

Buttons, icon buttons, links, inputs, selects, form fields, status indicators, feedback, skeletons, dialogs, drawers/sheets, menus, typography, layout, and responsive containers.

## Shared patterns to inventory

Page headers, navigation, search/filter bars, data lists/tables, pagination, cards used for meaningful grouping, forms, upload, confirmation, empty/error states, and any domain-specific repeated unit.

Every reusable API should use composition, slots, semantic props, predictable defaults, and documented variants. Avoid prop sprawl and page-specific escape hatches. Business rules, permissions, data access, validation, and side effects must not be buried in presentational components.

## Drift review

Before adding a component or variant, search all screens for equivalents and decide KEEP / IMPROVE / REPLACE / REMOVE. Migrate only after a representative use is verified.
