# PLL Two-Face Recognition Trainer — Design Document

## 1. Purpose

The PLL Two-Face Recognition Trainer is a browser-based application for practicing two-face PLL recognition.

Unlike a traditional PLL trainer, the application is organized around **recognition groups**. A recognition group represents a specific pair of visible patterns:

* Left-face pattern
* Right-face pattern

Examples include:

* `Headlights | Headlights`
* `None | Bar inside`
* `Bar outside | Solved`

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
* `Bar inside`
* `Bar outside`
* `None`
* `Solved`

#### Headlights

The two visible corner stickers on that side match one another.

#### Bar inside

A matching pair appears on the side of the face adjacent to the other visible face.

#### Bar outside

A matching pair appears on the side of the face away from the other visible face.

#### None

The face contains none of the structural pair patterns recognized by the classification system.

#### Solved

All three visible stickers on that side match.

The recognition system treats left and right independently. Therefore:

`Bar inside | Headlights`

and:

`Headlights | Bar inside`

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

A PLL observation represents a particular two-face view of a permutation.

An observation contains or references:

* PLL permutation
* Left-face pattern
* Right-face pattern
* Viewing orientation
* Logical cube state necessary to render the observation

A PLL may produce multiple observations because rotating the cube around the vertical axis may expose different adjacent pairs.

For example, `F` has three relevant pair-pattern observations:

* `Solved | None`
* `None | None`
* `None | Solved`

The trainer selects **observations**, not merely permutations.

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

For any observation presentation, if the left visible side index is `i`, the right visible side index is the next value in the sequence (wrapping at the end).

This keeps recognition and observation logic color-agnostic while preserving deterministic side adjacency.

---

### 7.8 Observation Color Layout Data

Each valid `(left pattern, right pattern, permutation)` triple shall map to explicit side-index sticker layout data sufficient to color the visible stickers deterministically.

At minimum, this layout data shall define ordered index triples for:

* The three visible stickers on the left face
* The three visible stickers on the right face

For example, a specific triple may map to:

* Left face indices: `(1, 3, 1)`
* Right face indices: `(2, 4, 2)`

This mapping is canonical domain data and must not be inferred by presentation components.

---

### 7.9 Color-Anchor Strategy

A color-anchor strategy abstraction shall determine the side index used for the current left visible face.

Given the left index, the right index is derived deterministically as the next sequence value.

For any valid structural pattern triple, there are four valid rendered index combinations corresponding to left anchors `1`, `2`, `3`, and `4`.

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
| None         | Solved        | F                          |
| Solved       | None          | F                          |
| Bar outside  | Solved        | Ja                         |
| Solved       | Bar inside    | Ja                         |
| Bar inside   | Solved        | Jb                         |
| Solved       | Bar outside   | Jb                         |
| Bar outside  | Bar outside   | Y                          |
| Bar inside   | Bar inside    | Aa, Ab                     |
| Headlights   | Bar outside   | Aa, Ga                     |
| Bar outside  | Headlights    | Ab, Gc                     |
| Bar inside   | None          | Ga, Y                      |
| Bar outside  | Bar inside    | Ja, Nb                     |
| Bar inside   | Bar outside   | Na, V                      |
| Headlights   | Bar inside    | Ra, T                      |
| Bar inside   | Headlights    | Rb, T                      |
| Headlights   | Solved        | Ua, Ub                     |
| Solved       | Headlights    | Ua, Ub                     |
| None         | Bar inside    | Gc, Gd, Y                  |
| Headlights   | Headlights    | H, Ua, Ub, Z               |
| None         | Headlights    | Aa, Ga, Gb, Gd, Ra         |
| Bar outside  | None          | Aa, Gd, Ra, T, V           |
| Headlights   | None          | Ab, Gb, Gc, Gd, Rb         |
| None         | Bar outside   | Ab, Gb, Rb, T, V           |
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
| Ua          | Headlights   | Solved        |
| Ua          | Solved       | Headlights    |
| Ub          | Headlights   | Headlights    |
| Ub          | Headlights   | Solved        |
| Ub          | Solved       | Headlights    |
| Z           | Headlights   | Headlights    |
| H           | Headlights   | Headlights    |
| Aa          | Bar inside   | Bar inside    |
| Aa          | Bar outside  | None          |
| Aa          | None         | Headlights    |
| Aa          | Headlights   | Bar outside   |
| Ab          | Bar inside   | Bar inside    |
| Ab          | Bar outside  | Headlights    |
| Ab          | Headlights   | None          |
| Ab          | None         | Bar outside   |
| E           | None         | None          |
| Ra          | Headlights   | Bar inside    |
| Ra          | Bar outside  | None          |
| Ra          | None         | None          |
| Ra          | None         | Headlights    |
| Rb          | Bar inside   | Headlights    |
| Rb          | Headlights   | None          |
| Rb          | None         | None          |
| Rb          | None         | Bar outside   |
| Ja          | Bar outside  | Solved        |
| Ja          | Solved       | Bar inside    |
| Ja          | Bar outside  | Bar inside    |
| Jb          | Solved       | Bar outside   |
| Jb          | Bar inside   | Bar outside   |
| Jb          | Bar inside   | Solved        |
| T           | Headlights   | Bar inside    |
| T           | Bar outside  | None          |
| T           | None         | Bar outside   |
| T           | Bar inside   | Headlights    |
| F           | Solved       | None          |
| F           | None         | None          |
| F           | None         | Solved        |
| V           | Bar inside   | Bar outside   |
| V           | Bar outside  | None          |
| V           | None         | None          |
| V           | None         | Bar outside   |
| Y           | None         | Bar inside    |
| Y           | Bar outside  | Bar outside   |
| Y           | Bar inside   | None          |
| Y           | None         | None          |
| Na          | Bar inside   | Bar outside   |
| Nb          | Bar outside  | Bar inside    |
| Ga          | Headlights   | Bar outside   |
| Ga          | Bar inside   | None          |
| Ga          | None         | None          |
| Ga          | None         | Headlights    |
| Gb          | None         | Bar outside   |
| Gb          | Bar inside   | None          |
| Gb          | None         | Headlights    |
| Gb          | Headlights   | None          |
| Gc          | Headlights   | None          |
| Gc          | None         | None          |
| Gc          | None         | Bar inside    |
| Gc          | Bar outside  | Headlights    |
| Gd          | Headlights   | None          |
| Gd          | None         | Bar inside    |
| Gd          | Bar outside  | None          |
| Gd          | None         | Headlights    |

This table is canonical application data for version 1.0.

Recognition-group candidate lists may be stored directly or derived from this observation dataset.

If both representations are stored, automated validation should ensure that they remain equivalent.

In addition, each valid `(left pattern, right pattern, permutation)` triple shall map to canonical side-index sticker layouts as described in section 7.8.

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

The primary visual element is an orthographic representation of the cube.

The trainer shall display:

* The yellow top face.
* Two adjacent side faces.

The cube should be large enough for sticker relationships to be immediately recognizable.

The visual emphasis is recognition rather than realistic three-dimensional rendering.

Perspective distortion should therefore be avoided.

---

### 12.2 Drawing the Cube

The cube shall be drawn by the application rather than represented by a library of pre-rendered PLL screenshots.

The renderer shall consume logical cube state from the state/service layer.

The specific browser-native rendering technique is an implementation decision.

Possible implementation mechanisms include:

* SVG
* CSS geometry
* Canvas

The design does not mandate one.

---

### 12.3 Renderer Responsibility

The cube renderer is a presentation component.

Its responsibility is limited to rendering current cube display state.

It must not know:

* Why the current cube state was selected.
* Which recognition groups are active.
* Which candidate PLLs are enabled.
* How cases are randomized.
* Which PLL is correct.
* Whether an answer was correct.
* How session statistics are calculated.
* How cube state is persisted.

The renderer may know only what is required to convert logical display state into visual geometry.

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

* Sticker display colors
* Sticker-border color
* Sticker-border width
* Top-face visibility
* Cube display orientation
* Appearance presets

The cube renderer may consume appearance state.

It must not own it.

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

The active training pool is derived from:

1. Enabled recognition groups.
2. Enabled candidates within each group.
3. Canonical observations belonging to those group/candidate combinations.

Conceptually:

`enabled recognition group + enabled group candidate → eligible observations`

The trainer shall not maintain a second manually synchronized list of eligible observations.

Eligibility must be derived from authoritative configuration state.

---

## 19. Case Selection

Case ordering shall be abstracted behind an ordering-strategy service.

If there are `n` enabled eligible observations, the ordering service shall return an ordered list containing `n` observations.

The trainer shall request and store one ordered list at a time (a bag), consume it sequentially, and request the next list only after the current list is exhausted.

Version 1.0 shall use a shuffled-bag canonical strategy:

* Return every currently eligible observation exactly once per bag.
* Return the bag in randomized order.

This guarantees even distribution within each bag while still providing random presentation order.

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

Determines the left visible side index for presentation.

The right visible side index is derived as the next value in the deterministic index sequence.

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

How a specific PLL appears within a specific viewing orientation/group.

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
→ `eligible observations`
→ `ordered bag`
→ `selected observation`
→ `color anchor`
→ `resolved side-index layout`
→ `cube state`
→ `rendering`

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
11. The ordering strategy returns all currently eligible observations exactly once in randomized order.
12. Trainer state stores the bag and activates its first observation.
13. Color-anchor strategy selects the left side index.
14. The right side index is derived as the next sequence value.
15. Triple-to-layout data resolves visible side-index sticker layouts.
16. Cube-state logic establishes the corresponding logical sticker state.
17. Cube renderer maps indices to concrete colors and renders the cube.
18. User inspects the cube.
19. User selects a PLL answer.
20. Answer-evaluation logic checks the selection.
21. Feedback state updates.
22. Display components react to the result.
23. If the answer was incorrect, the same observation remains active.
24. If the answer was correct on the first attempt, first-try-correct increments.
25. If the answer was correct after an incorrect attempt, the round completes without first-try credit.
26. The trainer advances to the next observation in the current bag.
27. When the current bag is exhausted, the trainer requests the next ordered bag.
28. Training continues.

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
* Valid `(left pattern, right pattern, permutation)` triples map to canonical side-index sticker layouts.
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

* The application draws an orthographic cube representation.
* Yellow is displayed on top.
* White is opposite yellow.
* The renderer maps side indices to canonical side colors.
* Side colors follow the canonical red → green → orange → blue order.
* The top and two adjacent sides are displayed.
* The rendered cube accurately represents the active observation.

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

* Only observations matching enabled groups and enabled group candidates may appear.
* Eligible observations are derived from configuration state.
* Case ordering is abstracted behind an ordering-strategy service.
* If `n` eligible observations exist, the strategy returns `n` ordered observations per bag.
* Version 1.0 uses a shuffled-bag strategy that returns each eligible observation exactly once per bag, in random order.
* The trainer consumes the active bag completely before requesting the next bag.
* The ordering strategy can be mocked or substituted for deterministic testing.
* The application handles an empty eligible pool without error.

### Color Strategy and Layout

* A color-anchor strategy abstraction determines the left side index.
* The right side index is derived as the next value in the deterministic repeating sequence.
* For any valid structural triple, the system can render four valid index-anchored color combinations.
* Triple-to-layout mapping data is explicit and consumed from domain/state data, not inferred by rendering logic.

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
