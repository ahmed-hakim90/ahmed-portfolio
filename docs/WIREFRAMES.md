# Wireframe Architecture — Ahmed Portfolio

This is a behavioral blueprint, not a redesign specification.

## Canonical screen anatomy

- Global navigation appropriate to authenticated state and permissions
- Page/screen header: location, title, concise context, one primary action
- Optional search/filter/summary only when it supports a real decision
- Main task content with deliberate reading and action order
- Contextual detail/edit surface that preserves the user's place when useful
- Local loading, empty, error, success, and recovery states

## Representative-screen method

Select one high-traffic primary-journey screen, one data-dense or management screen if present, and one form/detail screen. Establish hierarchy and responsive behavior there before scaling patterns.

## Responsive blueprint

- Mobile: single priority column, reachable primary actions, sheets/drawers for secondary controls, safe-area and keyboard awareness.
- Tablet: adaptive columns without desktop assumptions.
- Laptop/desktop: constrained content widths, efficient density, no gratuitous whitespace.
- RTL/LTR: identical information priority with directionally correct order, alignment, and controls.

## Required mapping before implementation

Page goal → user journey → information architecture → sections → priority → actions → states → responsive/RTL behavior → shared components.
