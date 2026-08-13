# PLL Two-Face Recognition Trainer — Design Document

## 1. Purpose

The PLL Two-Face Recognition Trainer is a browser-based application for practicing two-face PLL recognition.

Unlike a traditional PLL trainer, the application is organized around **recognition groups**. A recognition group represents a specific pair of visible patterns:

* Left-face pattern
* Right-face pattern

Examples include:

* `Headlights | Headlights`
* `None | 2-bar inside`
* `2-bar outside | 3-bar`

Each recognition group has one or more PLL permutations that may produce that visible pattern combination.

The trainer allows users to practice only the PLL cases belonging to selected recognition groups, making it possible to drill the exact visual distinctions required by a recognition decision tree.

The initial release is intentionally focused on recognition rather than algorithm execution, timing, cube customization, or comprehensive PLL training.

---

## 2. Goals

Version 1.0 shall:

* Run entirely in the browser.
* Be deployable as a static site.
* Be hostable for free using GitHub Pages.
* Use Angular and TypeScript.
* Render PLL observations as an orthographic cube visualization.
* Keep the cube oriented with yellow on top.
* Use standard cube colors in their standard relative positions.
* Allow the user to select recognition groups to practice.
* Allow the user to restrict which candidate PLLs within an enabled group may appear.
* Keep configuration controls collapsed when not actively being used.
* Allow the user to identify the displayed PLL.
* Immediately indicate whether an identification was correct or incorrect without alerts or modal interruptions.
* Track how many cases were identified correctly on the first attempt.
* Generate cases only from the currently enabled recognition-group/candidate configuration.
* Keep authoritative application and cube state outside display components.
* Represent the known PLL recognition catalog explicitly as application data.
* Keep domain logic color-agnostic by using side-color indices instead of concrete colors.

The application should be designed so that later releases can support additional trainer modes, cube customization, persistence, and timing without requiring a fundamental redesign.

---

## 3. Non-Goals for Version 1.0

The following features are explicitly excluded from version 1.0:

* Toggling whether the top face is displayed.
* Changing which cube color is on top.
* Customizing individual sticker display colors.
* Customizing sticker-border color.
* Customizing sticker-border width.
* Persisting cube appearance.
* Saving multiple appearance presets.
* Timing individual recognitions.
* Calculating average recognition time.
* Reset controls for timing or recognition statistics.
* A conventional trainer mode based only on directly selected PLL permutations.
* Algorithm execution training.
* PLL algorithm reference material.
* User accounts.
* Server-side persistence.
* Backend APIs.

These capabilities should remain architecturally possible without complicating the 1.0 implementation unnecessarily.

---

## 4. Deployment Architecture

### 4.1 Static Application

The application shall be a fully static Angular application.

Runtime execution shall occur entirely in the browser.

The deployed application consists only of static resources such as:

* HTML
* CSS
* JavaScript bundles
* Fonts or icons, if required
* Static application assets

No backend service is required.

---

### 4.2 Hosting

The production application shall be hosted using GitHub Pages.

The project repository shall contain the source application.

A GitHub Actions workflow shall produce and publish the deployable application.

The production build should:

1. Restore project dependencies.
2. Compile the Angular application.
3. Perform production optimization.
4. Bundle and minify scripts and styles.
5. Produce the static distribution directory.
6. Publish that directory to GitHub Pages.

Generated production bundles should not need to be manually committed to source control.

---

## 5. Technology

### 5.1 Framework

The frontend shall use Angular.

TypeScript shall be the primary application language.

Angular should be used for:

* Application composition
* State-driven rendering
* User interaction
* Configuration controls
* Trainer lifecycle
* Cube visualization integration

---

### 5.2 Styling

Application presentation should remain conceptually separate from component behavior wherever practical.

Components should primarily define:

* Structure
* Inputs
* Outputs
* Behavior
* State relationships

Visual design should primarily be controlled through stylesheets and reusable styling conventions.

Component-specific styles are acceptable where Angular's component model makes them useful, particularly for specialized visual components such as the cube renderer.

Business rules and trainer behavior must not depend on CSS.

---

## 6. Architectural Principles

### 6.1 Presentation Does Not Own Application State

Display components must not be authoritative owners of application or domain state.

Authoritative state shall live in services or an equivalent Angular state-management abstraction.

Display components may:

* Subscribe to application-state services.
* Receive immutable view models or observable state.
* Render current application state.
* Emit user-interaction events.

Display components must not maintain authoritative copies of application state that can diverge from the service/state layer.

---

### 6.2 Cube State Ownership

Cube data and cube state must **not** be owned or tracked by cube display components.

The authoritative cube state shall live outside the presentation layer.

Display components may:

* Subscribe to cube-state services.
* Receive the current cube display state.
* Render sticker positions and appearance.

Display components must not:

* Store the authoritative cube permutation.
* Store the authoritative logical sticker configuration.
* Mutate cube-state data directly.
* Determine which PLL observation is active.
* Generate or randomize trainer cases.
* Apply PLL transformations as part of rendering.
* Maintain hidden internal cube state that can diverge from authoritative application state.

The conceptual dependency is:

`Cube state service → display state → cube renderer`

not:

`Cube renderer → owns and mutates cube state`

---

### 6.3 Data-Driven Recognition

Recognition-group membership and PLL observations shall be represented as application data rather than component control-flow logic.

Adding, removing, or correcting recognition data should require updating the recognition catalog rather than introducing special-case UI conditions.

---

### 6.4 Separation of Logical State and Appearance

Logical cube state must remain separate from its visual presentation.

A sticker's logical color or identity shall not depend on:

* A CSS class
* A hex color
* A rendering-library object
* A specific screen coordinate

This distinction is required so that later appearance customization can change how a cube looks without changing what cube state it represents.

Domain and state logic must not depend on named colors (for example, red/green/orange/blue) when determining case validity, recognition-group membership, or observation identity.

Domain logic shall use side-color indices and index relationships. Rendering maps indices to concrete display colors.

---

## 7. Domain Model

### 7.1 PLL Permutation

A PLL permutation identifies one of the 21 standard PLL cases:

* `Aa`
* `Ab`
* `E`
* `F`
* `Ga`
* `Gb`
* `Gc`
* `Gd`
* `H`
* `Ja`
* `Jb`
* `Na`
* `Nb`
* `Ra`
* `Rb`
* `T`
* `Ua`
* `Ub`
* `V`
* `Y`
* `Z`

These shall be represented as domain values rather than arbitrary user-facing strings spread throughout the application.

---

### 7.2 Face Pattern

A face pattern represents the visually obvious pair structure on one visible side.

Version 1.0 defines exactly five pattern values:

* `Headlights`
* `2-bar inside`
* `2-bar outside`
* `None`
* `3-bar`

#### Headlights

The two visible corner stickers on that side match one another.

#### 2-bar inside

A matching pair appears on the side of the face adjacent to the other visible face.

#### 2-bar outside

A matching pair appears on the side of the face away from the other visible face.

#### None

The face contains none of the structural pair patterns recognized by the classification system.

#### 3-bar

All three visible stickers on that side match.

The recognition system treats left and right independently. Therefore:

`2-bar inside | Headlights`

and:

`Headlights | 2-bar inside`

are distinct recognition groups.

---

### 7.3 Recognition Group Key

A recognition group is uniquely keyed by:

`(left pattern, right pattern)`

The ordered nature of this key is significant.

The pair must not be normalized or treated as unordered.

---

### 7.4 Recognition Group

A recognition group contains:

* Left pattern
* Right pattern
* Candidate PLL permutations

For example:

`None | Bar inside → Gc, Gd, Y`

Recognition groups are the primary training-selection unit for version 1.0.

---

### 7.5 PLL Observation

A PLL observation is the combination of a PLL permutation and a recognition group in which that permutation can appear.

Formally, an observation is uniquely identified by:

* PLL permutation
* Recognition group (ordered left-face pattern, right-face pattern)

For each valid `(recognition group, PLL permutation)` combination there is exactly **one canonical normalized visible-sticker color layout** (see section 7.8).

A PLL may appear in multiple recognition groups because rotating the cube around the vertical axis exposes different adjacent face pairs.

For example, `F` has three valid observations:

* `3-bar | None`
* `None | None`
* `None | 3-bar`

The trainer selects **observations** (recognition-group/permutation pairs), not merely permutations.

**Color-anchor variants are not separate observations.** When an observation is selected for presentation, a color-anchor strategy independently selects one of the four valid rotations of that observation's canonical normalized layout (see section 7.9). The rotation does not change the recognition group, the PLL identity, or the correct answer. It only determines which physical side colors appear on the two visible faces.

Conceptually:
- *PLL observation* = (recognition group, PLL permutation) → one canonical normalized layout
- *Presented case* = selected PLL observation + independently chosen color anchor

---

### 7.6 Cube State

Cube state represents the logical sticker configuration independently from rendering.

It must contain sufficient information for a renderer to determine the visible sticker colors.

Cube state must not contain presentation-specific information such as:

* CSS classes
* Pixel coordinates
* SVG element references
* Border width
* Display color strings

The authoritative cube state shall be maintained outside display components.

---

### 7.7 Side-Color Index Model

Version 1.0 domain logic shall represent side colors by index, not by concrete color name.

The four side indices are:

* `1`
* `2`
* `3`
* `4`

They form a deterministic repeating sequence:

`1 → 2 → 3 → 4 → 1`

The active color assignment is represented by a cursor tracking which side color is currently assigned to logical position `1`.

Given that cursor value:

* Position `2` is derived as the next value in the sequence.
* Position `3` is derived as the second next value in the sequence.
* Position `4` is derived as the third next value in the sequence.

For any observation presentation, if the left visible side index is `i`, the right visible side index is the next value in the sequence (wrapping at the end).

This keeps recognition and observation logic color-agnostic while preserving deterministic side adjacency.

---

### 7.8 Canonical Observation Color Layout

Each valid `(recognition group, PLL permutation)` pair — i.e., each PLL observation — shall map to **exactly one** canonical normalized side-index sticker layout.

**Uniqueness invariant:** `(recognition group, PLL permutation)` → one canonical normalized layout.

No observation shall have multiple different canonical normalized layouts. If a dataset contains more than one distinct normalized layout for the same `(recognition group, PLL permutation)` key, the conflict must be resolved by physical cube verification before that data is used in implementation.

Canonical storage format for this mapping:

* `left = (Left_0, Left_1, Left_2)` — ordered side-color indices for the three visible left-face stickers
* `right = (Right_0, Right_1, Right_2)` — ordered side-color indices for the three visible right-face stickers

Normalization rule:

* `Left_0` is always `0` in the canonical form.

Anchor rotation rule:

* For anchor offset `a` in `{0, 1, 2, 3}`, each stored index `c` rotates to `(c + a) mod 4`.
* This produces the four valid color presentations of the same observation without storing additional rows.

This mapping is canonical domain data. Presentation components must not infer or synthesize it.

---

### 7.9 Color-Anchor Strategy

Once a PLL observation is selected, a color-anchor strategy independently selects which of the four valid anchor-rotations of that observation's canonical normalized layout to display.

Applying an anchor offset `a` to the canonical layout produces an anchored sticker layout by rotating each index: `(c + a) mod 4`. This does not change:

* the recognition group,
* the PLL observation identity, or
* the correct PLL answer.

The strategy may be modeled as a cursor selecting which physical color occupies the left-face anchor position, with remaining positions derived by fixed cyclic offsets.

For any valid observation, there are four valid anchored color presentations corresponding to anchor offsets `0`, `1`, `2`, and `3`.

The strategy abstraction allows deterministic testing and future strategy variation while preserving canonical adjacency rules.

---

## 8. Canonical Cube Color Model

Version 1.0 rendering shall use a fixed standard cube color arrangement.

Domain logic remains index-based. The renderer owns index-to-color mapping.

The opposite color pairs are:

* Yellow ↔ White
* Red ↔ Orange
* Green ↔ Blue

Yellow shall be displayed on top.

With yellow on top, the side-face order around the cube is:

`Red → Green → Orange → Blue → Red`

Therefore, the four valid adjacent side pairs around the cube are:

* Red / Green
* Green / Orange
* Orange / Blue
* Blue / Red

The logical color model shall exist independently from visual styling.

Renderer mapping for version 1.0 shall map side indices to these canonical side colors in sequence order.

---

## 9. Canonical Recognition Catalog

The following data is fixed domain data for version 1.0.

It shall be represented explicitly in the application rather than reconstructed through UI logic.

### 9.1 Recognition Groups

| Left pattern | Right pattern | Candidates                 |
| ------------ | ------------- | -------------------------- |
| None         | 3-bar         | F                          |
| 3-bar        | None          | F                          |
| 2-bar outside | 3-bar        | Ja                         |
| 3-bar        | 2-bar inside  | Ja                         |
| 2-bar inside  | 3-bar        | Jb                         |
| 3-bar        | 2-bar outside | Jb                         |
| 2-bar outside | 2-bar outside | Y                          |
| 2-bar inside  | 2-bar inside  | Aa, Ab                     |
| Headlights   | 2-bar outside | Aa, Ga                     |
| 2-bar outside | Headlights   | Ab, Gc                     |
| 2-bar inside  | None         | Ga, Y                      |
| 2-bar outside | 2-bar inside  | Ja, Nb                     |
| 2-bar inside  | 2-bar outside | Na, V                      |
| Headlights   | 2-bar inside  | Ra, T                      |
| 2-bar inside  | Headlights   | Rb, T                      |
| Headlights   | 3-bar         | Ua, Ub                     |
| 3-bar        | Headlights    | Ua, Ub                     |
| None         | 2-bar inside  | Gc, Gd, Y                  |
| Headlights   | Headlights    | H, Ua, Ub, Z               |
| None         | Headlights    | Aa, Ga, Gb, Gd, Ra         |
| 2-bar outside | None         | Aa, Gd, Ra, T, V           |
| Headlights   | None          | Ab, Gb, Gc, Gd, Rb         |
| None         | 2-bar outside | Ab, Gb, Rb, T, V           |
| None         | None          | E, F, Ga, Gc, Ra, Rb, V, Y |

There are therefore **24 recognition groups** in version 1.0.

Their candidate-count distribution is:

* 7 groups with one candidate
* 10 groups with two candidates
* 1 group with three candidates
* 1 group with four candidates
* 4 groups with five candidates
* 1 group with eight candidates

The seven single-candidate structural patterns permit recognition without any additional color-relationship analysis.

---

## 10. Canonical PLL Observation Data

The following table defines all known PLL-to-pattern observations used to derive the recognition groups.

Each row represents one valid two-adjacent-face pattern observation.

| Permutation | Left pattern | Right pattern |
| ----------- | ------------ | ------------- |
| Ua          | Headlights   | Headlights    |
| Ua          | Headlights   | 3-bar         |
| Ua          | 3-bar        | Headlights    |
| Ub          | Headlights   | Headlights    |
| Ub          | Headlights   | 3-bar         |
| Ub          | 3-bar        | Headlights    |
| Z           | Headlights   | Headlights    |
| H           | Headlights   | Headlights    |
| Aa          | 2-bar inside | 2-bar inside  |
| Aa          | 2-bar outside | None         |
| Aa          | None         | Headlights    |
| Aa          | Headlights   | 2-bar outside |
| Ab          | 2-bar inside | 2-bar inside  |
| Ab          | 2-bar outside | Headlights   |
| Ab          | Headlights   | None          |
| Ab          | None         | 2-bar outside |
| E           | None         | None          |
| Ra          | Headlights   | 2-bar inside  |
| Ra          | 2-bar outside | None         |
| Ra          | None         | None          |
| Ra          | None         | Headlights    |
| Rb          | 2-bar inside | Headlights    |
| Rb          | Headlights   | None          |
| Rb          | None         | None          |
| Rb          | None         | 2-bar outside |
| Ja          | 2-bar outside | 3-bar        |
| Ja          | 3-bar        | 2-bar inside  |
| Ja          | 2-bar outside | 2-bar inside |
| Jb          | 3-bar        | 2-bar outside |
| Jb          | 2-bar inside | 2-bar outside |
| Jb          | 2-bar inside | 3-bar         |
| T           | Headlights   | 2-bar inside  |
| T           | 2-bar outside | None         |
| T           | None         | 2-bar outside |
| T           | 2-bar inside | Headlights    |
| F           | 3-bar        | None          |
| F           | None         | None          |
| F           | None         | 3-bar         |
| V           | 2-bar inside | 2-bar outside |
| V           | 2-bar outside | None         |
| V           | None         | None          |
| V           | None         | 2-bar outside |
| Y           | None         | 2-bar inside  |
| Y           | 2-bar outside | 2-bar outside |
| Y           | 2-bar inside | None          |
| Y           | None         | None          |
| Na          | 2-bar inside | 2-bar outside |
| Nb          | 2-bar outside | 2-bar inside |
| Ga          | Headlights   | 2-bar outside |
| Ga          | 2-bar inside | None          |
| Ga          | None         | None          |
| Ga          | None         | Headlights    |
| Gb          | None         | 2-bar outside |
| Gb          | 2-bar inside | None          |
| Gb          | None         | Headlights    |
| Gb          | Headlights   | None          |
| Gc          | Headlights   | None          |
| Gc          | None         | None          |
| Gc          | None         | 2-bar inside  |
| Gc          | 2-bar outside | Headlights   |
| Gd          | Headlights   | None          |
| Gd          | None         | 2-bar inside  |
| Gd          | 2-bar outside | None         |
| Gd          | None         | Headlights    |

This table is canonical application data for version 1.0.

Recognition-group candidate lists may be stored directly or derived from this observation dataset.

If both representations are stored, automated validation should ensure that they remain equivalent.

In addition, each valid `(left pattern, right pattern, permutation)` triple shall map to canonical side-index sticker layouts as described in section 7.8.

### 10.1 Canonical Normalized Color Layout Dataset

This dataset is the canonical source for normalized visible-side colors.

**Uniqueness invariant:** Each `(Permutation, Left pattern, Right pattern)` key shall appear exactly once with one normalized layout. Multiple rows sharing a key are a data inconsistency requiring physical cube verification and resolution.

Composite key:

* `Permutation`
* `Left pattern`
* `Right pattern`

Normalized value shape:

* `left = (Left_0, Left_1, Left_2)`
* `right = (Right_0, Right_1, Right_2)`

Normalization rule:

* `Left_0` is always `0`.

Rotation rule:

* For anchor offset `a` in `{0,1,2,3}`, each stored side index `c` rotates to `(c + a) mod 4`.

Inversion rule:

* Any observed six-color value can be rotated so `Left_0 = 0`, then matched against this canonical dataset.

Data provenance note:

* This dataset was extracted from diagram sources and spot-checked on a physical cube for selected rows.
* **It currently contains known inconsistencies that must be resolved before the dataset is treated as implementation-ready.** See section 10.2 for a complete list.

| Perm | Left Pattern | Right Pattern | Left_0 | Left_1 | Left_2 | Right_0 | Right_1 | Right_2 |
| ---- | ------------ | ------------- | -----: | -----: | -----: | ------: | ------: | ------: |
| Ub   | Headlights   | Headlights    |      0 |      2 |      0 |       1 |       0 |       1 |
| Ub   | Headlights   | Headlights    |      0 |      3 |      0 |       1 |       0 |       1 |
| Ub   | Headlights   | 3-bar         |      0 |      3 |      0 |       1 |       1 |       1 |
| Ub   | 2-bar outside | Headlights   |      0 |      0 |      0 |       1 |       3 |       1 |
| Ua   | Headlights   | Headlights    |      0 |      1 |      0 |       1 |       2 |       1 |
| Ua   | Headlights   | Headlights    |      0 |      1 |      0 |       1 |       3 |       1 |
| Ua   | Headlights   | 3-bar         |      0 |      2 |      0 |       1 |       1 |       1 |
| Ua   | 2-bar outside | Headlights   |      0 |      0 |      0 |       1 |       2 |       1 |
| Z    | Headlights   | Headlights    |      0 |      3 |      0 |       1 |       2 |       1 |
| Z    | Headlights   | Headlights    |      0 |      1 |      0 |       1 |       0 |       1 |
| H    | Headlights   | Headlights    |      0 |      2 |      0 |       1 |       3 |       1 |
| Aa   | 2-bar inside | 2-bar inside  |      0 |      1 |      1 |       2 |       2 |       0 |
| Aa   | 2-bar outside | None         |      0 |      0 |      2 |       3 |       1 |       0 |
| Aa   | None         | Headlights    |      0 |      2 |      1 |       2 |       3 |       2 |
| Aa   | None         | 2-bar outside |      0 |      1 |      0 |       1 |       2 |       2 |
| Ab   | 2-bar inside | 2-bar inside  |      0 |      2 |      2 |       3 |       3 |       0 |
| Ab   | 2-bar outside | Headlights   |      0 |      0 |      1 |       2 |       1 |       2 |
| Ab   | Headlights   | None          |      0 |      3 |      0 |       1 |       0 |       2 |
| Ab   | None         | 2-bar outside |      0 |      3 |      1 |       2 |       0 |       0 |
| E    | None         | None          |      0 |      3 |      2 |       3 |       0 |       1 |
| E    | None         | None          |      0 |      1 |      2 |       3 |       2 |       1 |
| Ra   | Headlights   | 2-bar inside  |      0 |      3 |      0 |       1 |       1 |       2 |
| Ra   | 2-bar outside | Headlights   |      0 |      0 |      1 |       2 |       1 |       0 |
| Ra   | None         | None          |      0 |      3 |      2 |       3 |       1 |       0 |
| Ra   | None         | 2-bar outside |      0 |      2 |      1 |       2 |       1 |       2 |
| Rb   | 2-bar inside | Headlights    |      0 |      1 |      1 |       2 |       3 |       2 |
| Rb   | Headlights   | None          |      0 |      1 |      0 |       1 |       0 |       2 |
| Rb   | None         | None          |      0 |      3 |      1 |       2 |       1 |       0 |
| Rb   | None         | 2-bar outside |      0 |      3 |      2 |       3 |       0 |       0 |
| Ja   | 2-bar outside | 3-bar        |      0 |      0 |      1 |       2 |       2 |       2 |
| Ja   | 3-bar        | 2-bar inside  |      0 |      0 |      0 |       1 |       1 |       2 |
| Ja   | 2-bar outside | 2-bar inside |      0 |      0 |      1 |       2 |       2 |       0 |
| Ja   | 2-bar outside | 2-bar inside |      0 |      0 |      2 |       3 |       3 |       0 |
| Jb   | 3-bar        | 2-bar outside |      0 |      0 |      0 |       1 |       2 |       2 |
| Jb   | 2-bar inside | 2-bar outside |      0 |      1 |      1 |       2 |       0 |       0 |
| Jb   | 2-bar inside | 2-bar outside |      0 |      2 |      2 |       3 |       0 |       0 |
| Jb   | 2-bar inside | 3-bar         |      0 |      1 |      1 |       2 |       2 |       2 |
| T    | Headlights   | 2-bar inside  |      0 |      2 |      0 |       1 |       1 |       2 |
| T    | 2-bar outside | None         |      0 |      0 |      1 |       2 |       3 |       0 |
| T    | None         | 2-bar outside |      0 |      1 |      2 |       3 |       0 |       0 |
| T    | 2-bar inside | Headlights    |      0 |      1 |      1 |       2 |       0 |       2 |
| F    | 3-bar        | None          |      0 |      0 |      0 |       1 |       3 |       2 |
| F    | None         | Headlights    |      0 |      2 |      1 |       2 |       1 |       0 |
| F    | None         | None          |      0 |      3 |      2 |       3 |       2 |       0 |
| F    | None         | 3-bar         |      0 |      3 |      1 |       2 |       2 |       2 |
| V    | 2-bar inside | 2-bar inside  |      0 |      2 |      2 |       3 |       3 |       1 |
| V    | 2-bar outside | None         |      0 |      0 |      2 |       3 |       2 |       1 |
| V    | None         | None          |      0 |      3 |      2 |       3 |       2 |       1 |
| V    | None         | 2-bar outside |      0 |      3 |      2 |       3 |       1 |       1 |
| Y    | None         | 2-bar inside  |      0 |      1 |      2 |       3 |       3 |       1 |
| Y    | 2-bar outside | 2-bar outside |      0 |      0 |      2 |       3 |       1 |       1 |
| Y    | 2-bar inside | None          |      0 |      2 |      2 |       3 |       0 |       1 |
| Y    | None         | None          |      0 |      1 |      2 |       3 |       0 |       1 |
| Na   | 2-bar inside | 3-bar         |      0 |      2 |      2 |       3 |       1 |       1 |
| Nb   | 2-bar outside | Headlights   |      0 |      0 |      2 |       3 |       3 |       1 |
| Ga   | Headlights   | 2-bar outside |      0 |      3 |      0 |       1 |       2 |       2 |
| Ga   | 2-bar inside | None          |      0 |      1 |      1 |       2 |       3 |       0 |
| Ga   | None         | None          |      0 |      1 |      2 |       3 |       2 |       0 |
| Ga   | None         | None          |      0 |      3 |      1 |       2 |       1 |       2 |
| Gb   | None         | 2-bar outside |      0 |      2 |      1 |       2 |       0 |       0 |
| Gb   | 2-bar inside | None          |      0 |      2 |      2 |       3 |       1 |       0 |
| Gb   | None         | Headlights    |      0 |      2 |      1 |       2 |       0 |       2 |
| Gb   | Headlights   | None          |      0 |      2 |      0 |       1 |       3 |       2 |
| Gc   | Headlights   | None          |      0 |      1 |      0 |       1 |       3 |       2 |
| Gc   | None         | None          |      0 |      2 |      1 |       2 |       3 |       0 |
| Gc   | None         | 2-bar inside  |      0 |      1 |      2 |       3 |       3 |       0 |
| Gc   | None         | 2-bar inside  |      0 |      0 |      1 |       2 |       3 |       2 |
| Gd   | Headlights   | None          |      0 |      2 |      0 |       1 |       0 |       2 |
| Gd   | None         | 2-bar inside  |      0 |      3 |      1 |       2 |       2 |       0 |
| Gd   | 2-bar outside | None         |      0 |      0 |      2 |       3 |       2 |       0 |
| Gd   | None         | Headlights    |      0 |      2 |      1 |       2 |       0 |       2 |

---

### 10.2 Known Data Inconsistencies

The following inconsistencies between the section 10 observation table and the section 10.1 color layout dataset must be resolved by physical cube verification before the dataset is considered implementation-ready.

**Canonical layout uniqueness violations** (same `(Perm, Left, Right)` key appears with two different normalized layouts — both cannot be correct):

| Triple | Layout A | Layout B |
| ------ | -------- | -------- |
| Ub \| Headlights \| Headlights | L=(0,2,0) R=(1,0,1) | L=(0,3,0) R=(1,0,1) |
| Ua \| Headlights \| Headlights | L=(0,1,0) R=(1,2,1) | L=(0,1,0) R=(1,3,1) |
| Z \| Headlights \| Headlights  | L=(0,3,0) R=(1,2,1) | L=(0,1,0) R=(1,0,1) |
| E \| None \| None              | L=(0,3,2) R=(3,0,1) | L=(0,1,2) R=(3,2,1) |
| Ja \| 2-bar outside \| 2-bar inside | L=(0,0,1) R=(2,2,0) | L=(0,0,2) R=(3,3,0) |
| Jb \| 2-bar inside \| 2-bar outside | L=(0,1,1) R=(2,0,0) | L=(0,2,2) R=(3,0,0) |
| Ga \| None \| None             | L=(0,1,2) R=(3,2,0) | L=(0,3,1) R=(2,1,2) |
| Gc \| None \| 2-bar inside     | L=(0,1,2) R=(3,3,0) | L=(0,0,1) R=(2,3,2) |

**Observation triple discrepancies** (triples present in section 10 but absent from section 10.1, or vice versa):

Triples from section 10 not found in the layout dataset:

| Perm | Left | Right | Note |
| ---- | ---- | ----- | ---- |
| Ua   | 3-bar        | Headlights  | Dataset has Ua\|2-bar outside\|Headlights instead |
| Ub   | 3-bar        | Headlights  | Dataset has Ub\|2-bar outside\|Headlights instead |
| Aa   | Headlights  | 2-bar outside | Dataset has Aa\|None\|2-bar outside instead |
| Ra   | 2-bar outside | None      | Dataset has Ra\|2-bar outside\|Headlights instead |
| Ra   | None        | Headlights  | Dataset has Ra\|None\|2-bar outside instead |
| V    | 2-bar inside | 2-bar outside | Dataset has V\|2-bar inside\|2-bar inside instead |
| Na   | 2-bar inside | 2-bar outside | Dataset has Na\|2-bar inside\|3-bar instead |
| Nb   | 2-bar outside | 2-bar inside | Dataset has Nb\|2-bar outside\|Headlights instead |
| Ga   | None        | Headlights  | Dataset has a second Ga\|None\|None entry instead |
| Gc   | 2-bar outside | Headlights | Entirely absent from dataset |

Triples present in the layout dataset but not in section 10:

| Perm | Left | Right | Note |
| ---- | ---- | ----- | ---- |
| Ua   | 2-bar outside | Headlights  | Possibly Ua\|3-bar\|Headlights mislabeled |
| Ub   | 2-bar outside | Headlights  | Possibly Ub\|3-bar\|Headlights mislabeled |
| F    | None        | Headlights  | Not listed in section 10 observation table |
| V    | 2-bar inside | 2-bar inside | Section 10 lists V\|2-bar inside\|2-bar outside |
| Na   | 2-bar inside | 3-bar       | Section 10 lists Na\|2-bar inside\|2-bar outside |
| Nb   | 2-bar outside | Headlights | Section 10 lists Nb\|2-bar outside\|2-bar inside |

**Resolution requirement:** All inconsistencies above must be resolved against a physical cube before the dataset is promoted to implementation-ready status. Until resolved, the dataset is candidate-canonical only. The implementation plan tracks this work explicitly.

---

## 11. Observation Orientation

Each PLL observation must ultimately correspond to a concrete cube orientation sufficient to render the correct sticker arrangement.

The pattern tables identify which structural observations exist, but the cube renderer requires actual logical sticker state.

The application's recognition data shall therefore associate every observation with enough orientation information to establish the corresponding cube state.

The canonical representation may use either:

* A solved cube plus a PLL permutation and viewing orientation, or
* A precomputed logical sticker-state representation.

This is an implementation-level representation choice.

The following architectural rule is required regardless of representation:

> PLL and orientation data belong to the domain/state layer. The cube display component must not execute PLL algorithms or infer the case from a pattern description.

---

## 12. Cube Visualization

### 12.1 Presentation

The primary visual element is an **isometric** representation of the cube viewed from a slightly elevated front-right angle.

The trainer shall display:

* The yellow top face.
* Two adjacent side faces.

The cube should be large enough for sticker relationships to be immediately recognizable.

The visual emphasis is recognition rather than realistic three-dimensional rendering.

Perspective distortion (foreshortening) should therefore be avoided; isometric projection preserves face proportions without perspective.

---

### 12.2 SVG Rendering

Version 1.0 shall render the cube using browser-native **SVG**. Canvas, CSS-only geometry, pre-rendered images, and PLL screenshots are explicitly not used.

The cube SVG is composed from geometry owned by the renderer component. SVG presentation attributes such as `fill`, `stroke`, and `stroke-width` must not become domain data. Logical sticker identity and color data must not depend on pixel coordinates or SVG element references.

#### One Polygon Per Sticker

Every visible sticker must be rendered as its own individual SVG `<polygon>` element. An entire face must not be represented as one combined polygon, a background image, or any other flattened representation.

For the version 1.0 view (top face + two adjacent side faces) this means one `<polygon>` per visible sticker position. Each polygon has its own independently controlled geometry and visual properties.

This is an intentional architectural decision. The sticker-level granularity enables:

* independent per-sticker fill mapping from appearance state;
* configurable sticker colors in future versions without changing cube state;
* configurable sticker border color and width;
* straightforward inspection and debugging;
* resolution-independent responsive rendering;
* future pedagogical features that emphasize individual stickers or sticker relationships.

Version 1.0 does not implement those future features. The polygon-level structure preserves the capability.

#### Sticker Identity

Each sticker polygon has a stable semantic identity within the rendered view corresponding to face and position, for example `top-0` through `top-8`, `left-0` through `left-8`, `right-0` through `right-8`, or an equivalent typed representation. DOM `id` attributes are not mandatory, but stickers must be modeled and rendered individually so that any sticker can be independently targeted without redesigning the renderer.

#### Renderer Data Flow

The renderer conceptually receives:

`logical cube/display state` + `appearance state` → `SVG polygons`

Logical cube state determines which side-color index belongs on each sticker position. Appearance state determines how that index is displayed: concrete fill color, border color, border width. Changing appearance should change rendered sticker colors without changing logical cube state, observation data, or SVG geometry.

#### Solved-Layer Colors

The two bottom rows of each visible side face represent the two solved lower layers of the cube. For each presented case, the renderer independently selects a random base index `b ∈ {0, 1, 2, 3}`. The left visible face solved stickers use index `b`; the right visible face solved stickers use index `(b + 1) mod 4`. These solved-layer colors are independent of the U-layer PLL sticker colors and independent of the `Left_0` anchor.

---

### 12.3 Renderer Responsibility

The cube renderer is a presentation component implemented as an Angular component.

It receives or subscribes to resolved display state and appearance state, renders one SVG polygon per visible sticker, and maps logical sticker values through appearance state to SVG fill and stroke attributes.

The renderer must not:

* select cases or choose the active observation;
* determine which PLL is correct;
* evaluate answers;
* apply PLL algorithms;
* infer recognition groups from rendered geometry;
* own authoritative cube state;
* perform color-anchor randomization;
* know which recognition groups or candidates are enabled;
* know whether an answer was correct;
* know how session statistics are calculated.

---

## 13. Application State

Application state shall be exposed through Angular services or an equivalent state-management abstraction.

The design does not require a third-party state-management library.

The following responsibilities must remain conceptually separate.

---

### 13.1 Cube State

Owns:

* Current logical sticker state
* Current viewing orientation

Display components consume this state.

They do not own or mutate it.

---

### 13.2 Trainer State

Owns:

* Current PLL observation
* Current round
* Whether an incorrect attempt has occurred during that round
* Current answer-evaluation result

---

### 13.3 Trainer Configuration State

Owns:

* Enabled recognition groups
* Enabled candidate permutations for each recognition group

The eligible observation pool is derived from this state.

---

### 13.4 Session Statistics State

Owns:

* First-try-correct count
* Any future session metrics

The statistics display component merely presents these values.

---

### 13.5 Appearance State

Version 1.0 uses a fixed appearance.

The architecture should nevertheless maintain a clear future state boundary for:

* Sticker display colors (mapped from logical side-color indices to CSS color strings)
* Sticker-border color
* Sticker-border width
* Top-face visibility
* Cube display orientation
* Appearance presets

The SVG renderer consumes appearance state to set polygon `fill` and `stroke` attributes.

It must not own appearance state.

Version 1.0 should not implement persistence or preset machinery solely in anticipation of future requirements.

---

## 14. Trainer Configuration

### 14.1 Configuration Panel

Trainer configuration shall live inside an easily discoverable collapsed/expandable component.

The configuration panel should normally be collapsed so that it consumes minimal screen space while training.

Expanding it reveals recognition-group configuration.

Collapsing it must not modify configuration state.

---

## 15. Recognition Group Selection

All 24 canonical recognition groups shall be available for selection.

Groups shall be presented using selectable chips rather than conventional checkbox presentation.

Each recognition-group chip shall clearly communicate both ordered patterns.

Examples:

* `Headlights · Headlights`
* `None · Bar inside`
* `Bar outside · Solved`

The presentation must preserve the distinction between left and right.

---

### 15.1 Selecting a Group

Selecting a previously inactive group shall:

1. Enable that recognition group.
2. Reveal its candidate PLL controls.
3. Automatically enable all canonical candidates for that group.

For example, selecting:

`None | Bar inside`

shall reveal and initially enable:

`Gc` `Gd` `Y`

---

### 15.2 Deselecting a Group

Deselecting a recognition group shall:

1. Remove that group from the active training pool.
2. Hide its candidate PLL controls.

The user should not be required to manage candidate settings for groups that are not currently active.

---

## 16. Candidate Selection Within Groups

Candidate permutations shall also be represented as selectable chips.

The user may disable individual candidates within an enabled group.

For example:

`None | Bar inside`

normally enables:

`Gc` `Gd` `Y`

The user may disable `Y` to create a focused:

`Gc` vs `Gd`

recognition drill.

Candidate selection is **group-specific**.

For example, disabling `Gc` within:

`None | Bar inside`

does not inherently disable `Gc` within:

`Headlights | None`

if that second recognition group is also active.

This distinction is necessary because version 1.0 training is organized around observations within recognition groups, not a global permutation allow-list.

---

## 17. Empty Candidate Groups

An enabled recognition group containing zero enabled candidates cannot contribute observations to the trainer.

The UI may either:

* Prevent the user from disabling the final remaining candidate, or
* Permit an enabled but empty group and exclude it from the effective training pool.

The implementation plan may choose either behavior.

The trainer must nevertheless safely handle the resulting empty training pool.

---

## 18. Training Pool

The atomic unit of training eligibility is an enabled `(recognition group, PLL permutation)` combination.

Each enabled candidate PLL within each enabled recognition group contributes **exactly one** eligible training case.

For example, if the configuration is:

* `None | Bar inside → Gc, Gd, Y` (all enabled)
* `Headlights | None → Gc` (enabled)

the eligible pool contains exactly four entries:

* `(None | Bar inside, Gc)`
* `(None | Bar inside, Gd)`
* `(None | Bar inside, Y)`
* `(Headlights | None, Gc)`

The pool is **not** deduplicated by recognition group and **not** deduplicated by PLL permutation. `Gc` appearing as an enabled candidate in two different recognition groups contributes two distinct eligible cases. A recognition group with three enabled candidates contributes three distinct eligible cases.

Color-anchor variants of an eligible case do not create additional pool entries. The four anchor rotations of `(None | Bar inside, Gc)` still represent one eligible case. Anchor selection occurs after a case is selected from the pool.

Eligibility must be derived from authoritative configuration state. The trainer shall not maintain a second manually synchronized list.

---

## 19. Case Selection

Case ordering shall be abstracted behind an ordering-strategy service.

If there are `n` eligible `(recognition group, PLL permutation)` cases, the ordering service shall return a bag containing exactly `n` entries — one per eligible case.

The trainer shall request and store one bag at a time, consume it sequentially, and request the next bag only after the current bag is exhausted.

Version 1.0 shall use a shuffled-bag strategy:

* Each eligible `(recognition group, PLL)` case appears **exactly once** per bag.
* The bag is returned in randomized order.

A bag is explicitly **not**:

* One entry per enabled recognition group.
* One entry per unique enabled PLL.
* One randomly chosen PLL from each enabled recognition group.
* A random sample with replacement.

It is a randomized permutation of the complete set of currently eligible `(recognition group, PLL)` cases.

### Configuration Changes During a Bag

If the effective eligible pool changes while a bag is partially consumed — because the user enables or disables a recognition group or candidate — the remaining bag entries are invalidated. Before selecting the next case, the trainer shall derive the new eligible pool from current configuration state and request a fresh bag from the ordering strategy.

This ensures no disabled `(recognition group, PLL)` combination can be presented merely because it remained in a stale bag.

The ordering-strategy abstraction must support deterministic testing by allowing the strategy to be mocked or substituted.

Version 1.0 does not require:

* Weighted randomness
* Adaptive difficulty
* Error-based weighting
* Spaced repetition

The cube display component must not participate in case selection.

---

## 20. Case Activation

When an observation is selected:

1. The selected observation becomes the active trainer observation.
2. The state/service layer establishes its logical cube state and viewing orientation.
3. Cube state is published to subscribed consumers.
4. The cube renderer reacts to the updated state.
5. Round-specific answer state is initialized.

The trainer shall not instruct the cube component to "render Gc" or similar.

The cube display changes because authoritative cube state changed.

---

## 21. Identification Interface

The user must be able to identify the displayed permutation without typing.

PLL answer controls should use compact chip-like or button-like controls.

The answer set should contain the PLLs relevant to the current training configuration.

The exact presentation strategy may be refined during planning, but identification must remain fast enough for repeated recognition practice.

Answer controls shall emit selections to trainer logic.

They must not perform authoritative answer evaluation themselves.

---

## 22. Answer Evaluation

When the user selects a PLL:

1. Trainer logic compares the selected PLL with the active observation.
2. Trainer state records whether the answer was correct.
3. Session statistics are updated where appropriate.
4. Presentation reacts to the changed state.

No browser alert shall be used.

No modal dialog shall interrupt the session.

No dismissible toast is required.

Correct/incorrect feedback shall appear directly in the trainer interface.

Possible visual treatments include:

* Inline status text
* A state indicator near the cube
* Styling around the answer area
* Styling around the cube

The exact style is a presentation concern.

---

## 23. Multiple Attempts

A round may contain multiple guesses.

The application must distinguish between:

* Correct on first attempt
* Correct after one or more incorrect attempts

Once the user makes an incorrect guess, the current round permanently loses eligibility for first-try-correct credit.

The case remains active until the correct permutation is identified.

When the correct answer is eventually selected:

* The round completes.
* Statistics are updated as appropriate.
* Another observation becomes active.

The next case must not replace the current cube so quickly that the user cannot perceive whether their answer was correct.

The exact advancement interaction may be determined during implementation planning.

---

## 24. Statistics

Version 1.0 shall maintain a running count of:

`First-try correct`

This count increments only when the first submitted identification for a round is correct.

The statistic shall remain visible during training.

The application may also show total completed rounds if useful, but this is not required.

Statistics are session-local.

Refreshing or reopening the page may reset them.

No persistence is required in version 1.0.

Statistics state belongs to the application/service layer, not the display component that presents it.

---

## 25. Conceptual Application Boundaries

The following describe responsibilities, not necessarily a mandatory one-to-one Angular component/service structure.

### Recognition Catalog

Owns or exposes:

* PLL definitions
* Face-pattern definitions
* Canonical observation data
* Recognition-group relationships

---

### Case Selector

Determines eligible observations, requests ordered bags from the ordering strategy, and chooses the next observation from the active bag.

---

### Color Anchor Strategy

Operates on the canonical normalized layout of the **selected PLL observation**.

Selects an anchor offset `a` in `{0, 1, 2, 3}`, then applies it uniformly to produce an anchored sticker layout: each index `c` rotates to `(c + a) mod 4`.

Selecting a different anchor offset does not change the observation, the recognition group, or the correct answer. It only determines which physical side colors appear.

The strategy is replaceable to support deterministic tests and future behavior extensions.

---

### Color Layout Catalog

Owns canonical triple-to-side-index sticker layouts for valid `(left pattern, right pattern, permutation)` combinations.

Presentation components consume resolved layouts; they do not infer or synthesize them.

---

### Case Ordering Strategy

Owns the ordering algorithm for eligible observations.

Version 1.0 canonical strategy is shuffled bag.

The strategy must be replaceable so future versions can add alternative ordering approaches.

---

### Trainer

Coordinates the active training lifecycle.

---

### Cube State

Owns authoritative logical cube state and viewing orientation.

---

### Cube Renderer

Consumes cube state and renders it.

Does not own cube state.

---

### Trainer Configuration State

Owns enabled recognition groups and group-specific candidate selections.

---

### Configuration Display

Displays and manipulates configuration through events/actions.

Does not own authoritative configuration state.

---

### Identification Controls

Displays available answer choices and emits user selections.

Does not evaluate them.

---

### Answer Evaluation

Determines whether a submitted identification is correct and updates trainer state.

---

### Feedback Display

Displays current answer feedback.

Does not own that state.

---

### Session Statistics

Owns session-level recognition statistics.

---

### Statistics Display

Displays statistics.

Does not own or independently calculate authoritative statistics.

---

### Appearance State

Eventually owns visual cube customization.

Version 1.0 exposes fixed defaults only.

---

## 26. Initial Page Layout

The primary page should remain intentionally simple.

A typical layout is:

1. Compact application header/title.
2. Collapsed trainer-configuration control.
3. Cube visualization.
4. Correct/incorrect feedback.
5. PLL identification controls.
6. Running first-try-correct statistic.

The cube shall remain the dominant visual element.

Configuration should consume little or no permanent training space while collapsed.

The application should remain usable on desktop and mobile displays.

---

## 27. Empty Training Pool

The application must safely handle configurations that produce no eligible observations.

Examples include:

* No recognition groups selected.
* Every selected group has zero active candidates.

In this state:

* No invalid case-selection attempt shall occur.
* No display component shall invent a fallback cube.
* The application shall explain that at least one training case must be enabled.
* The configuration control shall remain readily discoverable.

This is a valid application state, not an exceptional failure.

---

## 28. Future Extension: Top-Face Visibility

A later release may allow the user to hide the top face.

The cube renderer should therefore not require top-face visibility as an invariant of logical cube state.

This feature changes presentation, not PLL state.

---

## 29. Future Extension: Cube Orientation

A later release may allow the user to choose which color is on top.

Logical cube colors, viewing orientation, and rendering must therefore remain separate concepts.

Recognition data should not be hard-coded around CSS assumptions that yellow must permanently occupy a specific rendered polygon.

Yellow-on-top is a version 1.0 trainer configuration, not a fundamental cube-model limitation.

---

## 30. Future Extension: Cube Appearance

Later versions may allow users to customize:

* Sticker colors
* Border color
* Border width

These changes belong to appearance state.

They shall not modify logical cube state or recognition data.

---

## 31. Future Extension: Appearance Presets

Later versions may allow users to:

* Save appearance settings.
* Load appearance settings.
* Maintain multiple appearance presets.

Persistence may use browser-local mechanisms such as cookies or another appropriate client-side store.

Version 1.0 shall not implement this persistence solely in anticipation of the feature.

---

## 32. Future Extension: Recognition Timing

A later version may measure:

`case presented → identification submitted`

Future statistics may include:

* Current recognition time
* Average recognition time
* Number of timed cases

The trainer lifecycle should therefore have identifiable state transitions for:

* Observation activation
* First answer submission
* Correct completion
* Next observation activation

Version 1.0 does not need to record timestamps.

---

## 33. Future Extension: Session Reset

A future control may reset:

* First-try-correct count
* Incorrect/correct statistics
* Timing history
* Average recognition time

Session state must therefore remain independent from trainer configuration.

---

## 34. Future Extension: Traditional PLL Trainer

A later trainer mode may allow the user to select permutations directly.

For example:

`Ga`, `Gb`, `Gc`, `Gd`

could be enabled globally, allowing the trainer to select any adjacent-face observation belonging to those PLLs.

The traditional trainer and recognition-group trainer should eventually share:

* Canonical PLL definitions
* Observation data
* Cube-state representation
* Cube-state services
* Cube renderer
* Answer evaluation
* Session statistics
* Trainer lifecycle

They differ primarily in how observations become eligible.

Version 1.0 must therefore avoid making recognition-group selection intrinsic to:

* PLL definitions
* Cube state
* Cube rendering

---

## 35. Extensibility Model

The architecture shall maintain the distinction between:

### Permutation

Which PLL case exists.

### Recognition Group

Which ordered pair of structural side-face patterns is being practiced.

### Observation

A specific PLL permutation within a specific recognition group, associated with exactly one canonical normalized side-color layout.

### Presented Case

The selected PLL observation after an anchor offset has been applied to its canonical normalized layout for display. The observation identity and correct answer are unchanged by anchor selection.

### Cube State

The logical sticker arrangement representing the active observation.

### Training Selection

Why a particular observation is eligible to appear.

### Ordering Strategy

How eligible observations are ordered and batched for presentation.

### Appearance

How the current cube state is visually presented.

### Rendering

The mechanical conversion of cube state plus appearance into visible geometry.

The conceptual flow is:

`Training configuration`
→ `eligible PLL observations`
→ `ordered bag`
→ `selected PLL observation`
→ `color anchor` (independently chosen; does not change observation identity)
→ `anchored logical sticker layout`
→ `appearance mapping`
→ `cube rendering`

The color anchor step is strictly separate from observation selection. A change in anchor offset is a presentation decision, not a case selection decision.

Presentation must not reverse this dependency by becoming the owner of upstream domain state.

---

## 36. Version 1.0 User Flow

A typical training session is:

1. User opens the trainer.
2. Configuration is initially collapsed.
3. User expands configuration.
4. User selects one or more recognition groups.
5. Each newly enabled group automatically enables all of its canonical candidates.
6. Candidate chips for selected groups become visible.
7. User optionally disables individual candidates within individual groups.
8. User collapses configuration.
9. Trainer configuration state determines the eligible observation pool.
10. Case selector requests an ordered bag from the ordering strategy.
11. The ordering strategy returns all currently eligible PLL observations exactly once in randomized order.
12. Trainer state stores the bag and activates its first observation.
13. Color-anchor strategy independently selects an anchor offset for presenting that observation.
14. The canonical normalized layout for the observation is rotated by the selected offset to produce the anchored sticker layout.
15. Cube-state logic establishes the logical sticker state from the anchored layout.
16. Cube renderer maps side-color indices to concrete colors and renders the cube.
17. User inspects the cube.
18. User selects a PLL answer.
19. Answer-evaluation logic checks the selection against the active observation's PLL permutation.
20. Feedback state updates.
21. Display components react to the result.
22. If the answer was incorrect, the same observation remains active (a new anchor may or may not be applied for the retry).
23. If the answer was correct on the first attempt, first-try-correct increments.
24. If the answer was correct after an incorrect attempt, the round completes without first-try credit.
25. The trainer advances to the next observation in the current bag.
26. When the current bag is exhausted, the trainer requests the next ordered bag.
27. Training continues.

---

## 37. Acceptance Criteria

Version 1.0 is complete when all of the following are true.

### Deployment

* The application builds as a static Angular site.
* The site can run without a backend.
* GitHub Actions builds the production application.
* Production JavaScript and CSS are bundled and optimized.
* GitHub Actions can publish the generated static application to GitHub Pages.

### Domain Data

* All 21 PLL permutations are represented as domain values.
* All five defined face-pattern values are represented as domain values.
* All 24 canonical recognition groups from this document exist in application data.
* Candidate lists match the canonical recognition-group table.
* All PLL-pattern observations from this document exist in application data.
* Each `(recognition group, PLL permutation)` pair maps to exactly one canonical normalized side-index sticker layout (`Left_0 = 0`).
* No `(recognition group, PLL permutation)` pair has multiple conflicting canonical normalized layouts.
* The canonical normalized layout dataset has been verified against a physical cube and all section 10.2 inconsistencies have been resolved.
* Automated tests verify the uniqueness invariant: no duplicate keys with different layouts.
* Recognition data is not duplicated as special-case UI logic.
* Recognition-group keys preserve ordered left/right semantics.

### Cube State

* Logical cube state is maintained outside display components.
* The cube renderer does not own authoritative sticker state.
* The cube renderer does not execute trainer case-selection logic.
* The cube renderer does not apply PLL algorithms as part of presentation.
* The cube renderer updates when authoritative cube state changes.
* Domain/state logic remains color-agnostic and uses side-color indices.
* Logical cube state is independent from visual styling.

### Cube Display

* The application renders the cube using browser-native SVG.
* Canvas, pre-rendered images, and PLL screenshots are not used.
* Every visible sticker is rendered as exactly one individual SVG `<polygon>` element.
* Each polygon's `fill` is derived from the logical side-color index for that sticker position through appearance/color mapping.
* Sticker border styling (`stroke`, `stroke-width`) is appearance data, not logical cube state.
* Yellow is displayed on top.
* White is opposite yellow.
* Side-color indices map to the canonical red → green → orange → blue sequence.
* The top face and two adjacent side faces are displayed in an isometric projection without perspective distortion.
* Each visible side face is rendered as a full 3×3 grid: the U-layer row shows PLL sticker colors; the bottom two rows show solved-layer colors.
* Solved-layer colors use a randomly chosen sequential pair `(b, (b+1)%4)` independent of the PLL sticker colors.
* The SVG output is isometric and resolution-independent.
* Updating authoritative cube/display state causes the corresponding polygon fills to update.
* Changing appearance mapping changes rendered sticker colors without changing logical cube state.
* Cube geometry (polygon coordinates) is independent from PLL identity and recognition-group logic.
* Each sticker polygon has a stable semantic identity (face + row + column) so that individual stickers can be targeted in future without redesigning the renderer.

### Configuration

* Recognition groups are selectable using chips.
* All canonical recognition groups can be selected.
* Left and right pattern order is clear in the UI.
* Selecting a group reveals its canonical candidate PLLs.
* Selecting a group initially enables all candidates in that group.
* Candidate PLLs can be individually enabled or disabled.
* Candidate selection is scoped to the recognition group.
* Deselecting a recognition group hides its candidate controls.
* The configuration UI can be collapsed.
* Collapsing configuration does not alter configuration state.
* Authoritative configuration state exists outside display components.

### Case Selection

* The atomic unit of eligibility is an enabled `(recognition group, PLL permutation)` combination.
* Each enabled candidate PLL within an enabled recognition group contributes exactly one eligible case.
* The same PLL enabled in two different recognition groups contributes two distinct eligible cases.
* A recognition group with `k` enabled candidate PLLs contributes exactly `k` eligible cases.
* Eligible cases are derived from configuration state; no separate synchronized list is maintained.
* Case ordering is abstracted behind an ordering-strategy service.
* If there are `n` eligible `(recognition group, PLL)` cases, the ordering strategy returns a bag of exactly `n` entries.
* Version 1.0 uses a shuffled-bag strategy: each eligible case appears exactly once per bag, in random order.
* Color-anchor variants do not create additional bag entries; each eligible case contributes one bag entry regardless of how many anchor rotations it has.
* Color-anchor selection occurs after a bag entry is selected, not before.
* The trainer consumes the active bag sequentially; when the bag is exhausted, the next bag is generated from the then-current eligible pool.
* If effective configuration changes while a bag is partially consumed, the remaining bag is invalidated and a fresh bag is generated from the updated eligible pool before the next case is selected.
* The ordering strategy can be mocked or substituted for deterministic testing.
* The application handles an empty eligible pool without error.
* Automated tests cover:
  * A group with `k` candidates contributes exactly `k` bag entries.
  * The same PLL in two groups contributes two distinct bag entries.
  * Each eligible case appears exactly once per bag.
  * No disabled group/candidate combination appears in any bag.
  * A bag has exactly `n` entries when there are `n` eligible cases.
  * Shuffling changes order only; bag membership is unchanged.
  * Color-anchor variants do not multiply bag entries.
  * Configuration changes invalidate the remaining bag before the next case is selected.

### Color Strategy and Layout

* Observation selection is independent from color-anchor selection.
* The color-anchor strategy operates on the canonical normalized layout of the selected PLL observation.
* Applying an anchor offset does not change the recognition group, the observation identity, or the correct answer.
* For any valid observation, the system can produce all four anchored color presentations (offsets 0, 1, 2, 3).
* Automated tests verify that all four anchor variants of any observation are classified into the same recognition group.
* Automated tests verify that the correct PLL answer is the same for all four anchor variants of any observation.
* Triple-to-layout mapping data is explicit and consumed from domain/state data, not inferred by rendering logic.
* The color-anchor strategy can be mocked or substituted for deterministic testing.

### Identification

* Users can identify the displayed PLL without typing.
* Answer controls emit selections rather than owning evaluation state.
* Trainer logic determines whether the answer is correct.
* Correct identification is clearly indicated inline.
* Incorrect identification is clearly indicated inline.
* No browser alert is used.
* No modal must be dismissed between attempts.
* Incorrect guesses leave the current observation active.
* The user may continue guessing until correct.

### Statistics

* The application tracks first-try-correct results.
* A correct first identification increments the first-try-correct total.
* Any incorrect identification permanently removes first-try eligibility for that round.
* Later correction does not increment first-try-correct.
* The first-try-correct total remains visible during training.
* Statistics state is maintained outside display components.

### Architecture

* Display components do not own authoritative application state.
* Display components may subscribe to services or equivalent state abstractions.
* Authoritative state flows toward presentation.
* Recognition data is separate from presentation.
* Trainer configuration is separate from cube state.
* Cube state is separate from cube appearance.
* Cube appearance is separate from rendering mechanics.
* Permutations, recognition groups, observations, cube state, training selection, appearance, and rendering remain conceptually distinct.
* The architecture does not prevent the explicitly identified post-1.0 features.
