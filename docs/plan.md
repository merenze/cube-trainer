# PLL Recognition Trainer v1 - Execution Plan

## Completed Work

1. Foundation and constraints
- Confirmed project constraints from design: static frontend only, service-owned state, ordered left/right recognition semantics, and color-agnostic domain model.
- Locked dependency boundary: no WWL-owned components or libraries.
- Scaffolded Angular app in app with baseline scripts and test workflow.

2. Core domain primitives and recognition model
- Implemented canonical PLL and face-pattern primitives in app/src/app/domain/pll-catalog.ts.
- Implemented ordered recognition-group key creation/splitting in app/src/app/domain/recognition-group-key.ts.
- Implemented canonical 24 recognition groups plus validity/lookup helpers in app/src/app/domain/recognition-groups.ts.
- Added and passed unit tests for all of the above domain modules.

3. Color-agnostic layout and inversion primitives
- Implemented side-color layout rotation and normalization utilities in app/src/app/domain/observation-color-layout.ts.
- Added tests for modulo-4 rotation, full-layout rotation, and normalization with anchor recovery.

4. Canonical normalized triplet color catalog
- Implemented typed triplet color catalog and keying in app/src/app/domain/observation-color-catalog.ts.
- Loaded the full 71-row normalized mapping dataset from the design.
- Implemented inverse lookup from observed rotated layout back to normalized mappings.
- Added integrity tests for row count, normalization invariant (Left_0 == 0), index range validity, and lookup behavior.

5. Design and plan documentation updates
- Updated docs/initial-design.md with side-index model, cursor/anchor semantics, rotation/inversion rules, and full normalized dataset.
- Synced session plan decisions to reflect dataset provenance and QA verification responsibility.

6. Verification status
- Current unit test suite passes after each completed slice.

## Remaining Plan

### Phase 3 - State Services and Selection Engine

1. Implement trainer-configuration state service
- Own enabled groups and per-group enabled candidates.
- Support select/deselect behavior.
- Enable canonical candidates by default when group activates.

2. Implement eligible-observation derivation service
- Derive eligibility from authoritative configuration state.
- Avoid duplicated hand-maintained pools.

3. Implement case-ordering strategy abstraction
- Contract: given n eligible observations, return n ordered observations.

4. Implement canonical shuffled-bag strategy
- Return each eligible observation exactly once per bag.
- Randomized order within the bag.

5. Implement case-selector service
- Derive eligibility, request/hold bags, serve sequentially.
- Request next bag only when current bag is exhausted.
- Handle empty pool safely.

6. Implement color-anchor strategy abstraction
- Select left side index for presentation.
- Derive right side index deterministically from cyclic order.

7. Implement trainer lifecycle state service
- Manage active observation, attempt-history flag, evaluation feedback, and transitions.

8. Implement session statistics state service
- Track first-try-correct and optional completed-round count.

### Phase 4 - Cube State and Rendering Pipeline

1. Implement cube-state service
- Resolve active observation to logical display state using triplet layout plus anchor-derived indices.

2. Separate logical state from appearance defaults
- Keep v1 fixed appearance while preserving clear customization boundary.

3. Build display-only orthographic cube renderer
- Subscribe to cube state.
- Map side indices to display colors.
- Render top plus two adjacent faces.

4. Add renderer and state mapping tests
- Validate yellow-top and side-order constraints.
- Validate side-index-to-color mapping correctness.
- Validate no mutation of authoritative state by renderer.

5. Add deterministic anchor-coverage tests
- Prove each valid structural triplet can render all 4 anchor combinations without changing recognition identity.

### Phase 5 - UI Composition and Interaction

1. Build page shell
- Compact header, collapsible configuration panel, cube viewport, inline feedback zone, answer controls, stats.

2. Implement recognition-group chip controls
- Preserve ordered left/right labeling.

3. Implement per-group candidate controls
- Show only for enabled groups.
- Maintain group-scoped toggles.

4. Implement answer control surface
- Emit selected PLL to trainer logic only.
- Keep evaluation logic out of presentation controls.

5. Implement inline feedback and pacing
- Correct/incorrect feedback visible without alerts.
- Preserve round progression behavior.

6. Implement robust empty-pool UX
- Clear guidance and discoverable configuration path.

### Phase 6 - Deployment and Quality Gates

1. Configure GitHub Actions for CI/CD
- Install dependencies, run lint/tests, build production output, publish to GitHub Pages.

2. Validate production build characteristics
- Static assets only, optimized bundles, no backend assumptions.

3. Run acceptance-traceability pass
- Trace design acceptance criteria to implementation evidence.

### Phase 7 - Documentation and Handoff

1. Update README
- Setup, test/build commands, deployment workflow, architecture boundaries.

2. Add concise architecture map
- Service/component boundaries and extension seams (appearance, timing, traditional PLL mode).

## Verification Focus For Remaining Work

1. Unit tests
- Eligibility derivation, ordering contracts, bag behavior, lifecycle transitions, first-try-correct logic.

2. Component tests
- Configuration interactions, empty-pool messaging, inline feedback rendering.

3. Renderer tests
- Logical-to-view-model mapping and orientation invariants.

4. End-to-end checks
- Full training flow from selection to answer handling and progression.

5. CI checks
- Lint, test, production build, deployment pipeline.
