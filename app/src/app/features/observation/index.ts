/**
 * Observation Feature Barrel Export
 *
 * Exposes public API for observation-related functionality (cube display and state).
 *
 * This feature is responsible for:
 * - Managing cube state (colors, rotations, patterns)
 * - Rendering the cube with proper visual representation
 * - Applying color anchors and display rules
 *
 * Internal imports:
 * - Only import from ./services and ./components subdirectories
 *
 * External imports:
 * - Other features may import from this barrel
 * - No circular imports with other features
 */

// Re-export from current locations (will move to ./services and ./components in future iterations)
export { AppearanceService } from '../../services/appearance.service';
export { CubeStateService, type CubeDisplayState } from '../../services/cube-state.service';
export { CubeRendererComponent } from '../../components/cube-renderer.component';
