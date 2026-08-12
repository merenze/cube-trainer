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
- Loaded the 71-row candidate normalized mapping dataset extracted from design sources.
- Implemented inverse lookup from observed rotated layout back to normalized mappings.
- Added integrity tests for row count, normalization invariant (Left_0 == 0), index range validity, and lookup behavior.
- NOTE: Dataset is candidate-canonical only. See section 10.2 of initial-design.md for known inconsistencies requiring physical cube verification.

5. Design and plan documentation updates
- Updated docs/initial-design.md with side-index model, cursor/anchor semantics, rotation/inversion rules, normalized dataset, and full data inconsistency report.
- Clarified domain invariant: each (recognition group, PLL) pair maps to exactly one canonical normalized layout; color-anchor variants are presentations, not separate observations.
- Established the conceptual pipeline: training configuration → eligible PLL observations → ordered bag → selected observation → color anchor (independent) → anchored layout → appearance → rendering.

6. State services and selection engine (Phase 3 complete)
- TrainerConfigurationService: owns enabled groups and per-group candidates.
- EligibleObservationService: derives eligibility from authoritative configuration state. Each enabled (recognition group, PLL) combination is one eligible case; the service does not deduplicate by group or by PLL.
- CaseOrderingStrategy abstraction + CaseOrderingStrategy injection token.
- ShuffledBagOrderingStrategy: Fisher-Yates shuffle, returns each eligible (recognition group, PLL) case exactly once per bag. Color-anchor variants are not bag entries.
- CaseSelectorService: manages bag lifecycle, re-queries eligibility on bag exhaustion.
  - NOTE: bag-invalidation on mid-bag configuration change is not yet implemented. This is tracked as a Phase 4 prerequisite below.
- ColorAnchorStrategy abstraction + COLOR_ANCHOR_STRATEGY injection token.
- TrainerLifecycleService: signals-based round lifecycle with answer evaluation and first-try tracking.
- SessionStatisticsService: tracks first-try-correct and total rounds.

7. Cube state and appearance (Phase 4 in progress)
- CubeStateService: computed signal from lifecycle's resolvedLayout.
- AppearanceService: fixed v1 index-to-color mapping (Red/Green/Orange/Blue sequence).

## Prerequisite: Canonical Data Validation (blocks Phase 4 completion)

The canonical color layout dataset contains known inconsistencies that must be resolved before Phase 4 tests can treat the dataset as implementation-ready. See docs/initial-design.md section 10.2 for the full list.

Required resolution steps (in order):

1. Verify conflicting duplicate rows against a physical cube.
   - 9 triples have two different normalized layouts in the dataset. One layout is correct; the other is an error.
   - Resolve each by physical verification and remove the incorrect row from the catalog.

2. Reconcile observation triple mismatches between section 10 and section 10.1.
   - 16 triples appear in section 10 (observation table) but not in section 10.1 (color layout dataset), or with different left/right pattern values.
   - Each discrepancy may represent a labeling error in the observation table, a labeling error in the layout dataset, or a genuinely missing layout row.
   - Resolve by physical verification; update whichever source is wrong.

3. After resolution, add automated uniqueness validation tests to observation-color-catalog.spec.ts:
   - No (recognition group, PLL) key appears more than once.
   - Every key from the section 10 observation table has exactly one layout row in the catalog.
   - Every layout row in the catalog corresponds to a key in the section 10 observation table.

4. After resolution, update observation-color-catalog.ts to reflect the corrected dataset.

Until these steps are complete, the catalog is candidate-canonical and Phase 4 anchor-coverage tests cannot be run end-to-end against real data.

## Prerequisite: Bag-Invalidation on Configuration Change

CaseSelectorService currently re-queries eligibility only when the bag is exhausted. It does not invalidate the remaining bag when configuration changes mid-bag. This must be implemented before the application satisfies the configuration-change invariant in section 19.

Required steps:

1. Expose a change-notification mechanism from TrainerConfigurationService (e.g., a signal revision counter or an explicit `configurationVersion` signal).
2. CaseSelectorService captures the configuration version when it fills a bag.
3. On each `nextCase()` call, if the current configuration version differs from the captured version, invalidate the remaining bag and refill from the updated eligible pool before returning the next case.
4. Add tests:
   - Disabling a group mid-bag does not cause any further case from that group to be returned.
   - Disabling a candidate mid-bag does not cause that candidate to be returned from the remaining bag.
   - A fresh bag after invalidation reflects only the current eligible pool.

## Remaining Plan

### Phase 4 - Cube State and Rendering Pipeline (in progress)

Completed:
- Cube-state service (computed signal from resolved layout).
- Appearance service (fixed v1 index-to-color mapping).

Remaining:

1. Build the SVG cube renderer component.
   - Angular standalone component; consumes CubeStateService and AppearanceService.
   - Renders one SVG `<polygon>` per visible sticker: top face (9 stickers), left face (visible stickers), right face (visible stickers).
   - Each polygon's `fill` is derived from the logical side-color index via AppearanceService.sideIndexToColor(). Top stickers use AppearanceService.topColor.
   - Polygon coordinates (geometry) are presentation-only constants defined in the component or a co-located geometry helper; they are not part of logical cube state.
   - Each sticker polygon has a stable semantic identity (face + position index, e.g. `top-0`, `left-2`, `right-1`) to support future per-sticker targeting.
   - Canvas, CSS-only geometry, and pre-rendered images are not used.
   - Orthographic layout; no perspective distortion.
   - Responsive via SVG viewport/viewBox.

2. Add renderer component tests.
   - Verify the component renders using SVG (no Canvas).
   - Verify the expected number of `<polygon>` elements exists for the top, left, and right faces.
   - Verify that changing the logical side-color index for a sticker position updates the corresponding polygon's `fill` without changing any other sticker.
   - Verify top-face polygons always use the yellow appearance color regardless of logical state.
   - Verify sticker border attributes (stroke/stroke-width) come from AppearanceService, not from domain/state data.
   - Verify that providing a new CubeDisplayState updates fills; providing null clears or hides the cube.

3. Add anchor-coverage tests (requires clean catalog — see canonical data validation prerequisite).
   - For each valid observation in the corrected catalog, verify that applying each of the four anchor offsets produces a layout that normalizes back to the same canonical layout.
   - Verify that the recognition group derived from each anchored variant matches the observation's recognition group.

4. Wire up concrete ColorAnchorStrategy implementation.
   - Implement RandomColorAnchorStrategy: selects one anchor offset uniformly at random from {0, 1, 2, 3} and applies it to the observation's canonical normalized layout.
   - Register in app providers via COLOR_ANCHOR_STRATEGY token.

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
- Include evidence that data inconsistencies from section 10.2 are resolved and that uniqueness tests pass.

### Phase 7 - Documentation and Handoff

1. Update README
- Setup, test/build commands, deployment workflow, architecture boundaries.

2. Add concise architecture map
- Service/component boundaries and extension seams (appearance, timing, traditional PLL mode).
- Note observation vs. presented-case distinction.

## Verification Focus For Remaining Work

1. Unit tests
- Catalog uniqueness invariant (after data resolution).
- Eligibility derivation: each enabled (recognition group, PLL) contributes exactly one eligible case; deduplication by group or by PLL is absent.
- Bag membership: a group with k candidates yields k bag entries; the same PLL in two groups yields two distinct bag entries; each eligible case appears exactly once per bag.
- Anchor independence: color-anchor variants do not add bag entries; anchor selection occurs after case selection.
- Configuration-change invalidation: disabling a group or candidate mid-bag prevents stale entries from being presented.
- Ordering contracts, bag behavior, lifecycle transitions, first-try-correct logic.
- Anchor-coverage invariant: all four anchor variants of any observation map back to the same canonical layout and recognition group.

2. Component tests
- Configuration interactions, empty-pool messaging, inline feedback rendering.

3. Renderer tests
- Logical-to-view-model mapping and orientation invariants.

4. End-to-end checks
- Full training flow from selection to answer handling and progression.

5. CI checks
- Lint, test, production build, deployment pipeline.
- Lint, test, production build, deployment pipeline.
