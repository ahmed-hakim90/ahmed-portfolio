# Product Foundation — Ahmed Portfolio

## Evidence and scope

This foundation is based on the repository structure, package metadata, and available README. The detected implementation is **Next.js/React and Tailwind CSS**, and the product is treated as a **content/marketing experience**. Unknown business facts remain explicit assumptions and must be validated before feature work.

## Product purpose and users

Protect the project's existing core journey and clarify it before redesign. Primary users, roles, permissions, revenue model, and success metrics must be confirmed from routes, data models, and stakeholder requirements; do not invent them from the repository name.

## Audit decisions

### KEEP

- Working domain flows, integrations, data contracts, and recognizable product identity.
- Existing reusable primitives and patterns that are consistent, accessible, responsive, and actively used.

### IMPROVE

- Information hierarchy, responsive composition, state coverage, accessibility, and token consistency.
- Discoverability and efficiency of the primary journey appropriate to a content/marketing experience.

### REPLACE

- Only duplicated or inaccessible patterns after a shared replacement is proven on representative screens.
- Local visual exceptions when a semantic token or shared variant can express the requirement.

### REMOVE

- Dead UI, duplicate actions, decorative clutter, unexplained one-off styles, and dependencies proven unused.
- Never remove business capability based only on visual preference.

### MISSING FOUNDATION

- Verified role/permission matrix, product metrics, canonical journey map, complete state inventory, and regression baseline.
- A documented decision log linking durable product and architecture changes to evidence.

## Delivery sequence

Foundation → Shared primitives → Shared patterns → Representative screens → Remaining screens → Responsive/RTL QA → Regression review

Each stage must be reviewable and reversible. No mass redesign is authorized by this document.
