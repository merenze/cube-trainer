/**
 * Session Stats Feature Barrel Export
 *
 * Exposes public API for session statistics and performance tracking.
 *
 * This feature is responsible for:
 * - Tracking session statistics (correct/incorrect answers)
 * - Calculating performance metrics
 * - Recording performance history
 *
 * Internal imports:
 * - Only import from ./services and ./components subdirectories
 *
 * External imports:
 * - Other features may import from this barrel
 * - No circular imports with other features
 */

// Re-export from current locations (will move to ./services in future iterations)
export { SessionStatisticsService } from '../../services/session-statistics.service';
