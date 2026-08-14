/**
 * Candidate Selection Feature Barrel Export
 *
 * Exposes public API for candidate selection functionality (PLL case selection).
 *
 * This feature is responsible for:
 * - Finding eligible PLL candidates based on observations
 * - Selecting and ordering candidates using various strategies
 * - Managing color anchors for candidate presentation
 * - Configuring trainer settings and recognition groups
 * - Handling user answer input
 *
 * Internal imports:
 * - Only import from ./services and ./components subdirectories
 *
 * External imports:
 * - Other features may import from this barrel
 * - Depends on domain layer (catalogs)
 * - No circular imports with other features
 */

// Re-export from current locations (will move to ./services and ./components in future iterations)
export { EligibleObservationService, type EligibleObservation } from '../../services/eligible-observation.service';
export { CaseSelectorService } from '../../services/case-selector.service';
export { TrainerConfigurationService, type ConfigSnapshot } from '../../services/trainer-configuration.service';
export { COLOR_ANCHOR_STRATEGY, type ColorAnchorStrategy } from '../../services/color-anchor-strategy';
export { CASE_ORDERING_STRATEGY, type CaseOrderingStrategy } from './services/case-ordering-strategy';
export { RandomColorAnchorStrategy } from '../../services/random-color-anchor-strategy';
export { ShuffledBagOrderingStrategy } from './services/shuffled-bag-ordering-strategy';
export { AnswerControlComponent } from '../../components/answer-control.component';
export { TrainerConfigurationComponent } from '../../components/trainer-configuration.component';
