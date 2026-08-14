/**
 * Domain Layer Barrel Export
 *
 * This is the public API of the domain layer. Features import shared, immutable
 * domain models and catalogs through this barrel export.
 *
 * The domain layer contains:
 * - PllPermutation, FacePattern, RecognitionGroupKey enums/types
 * - Canonical recognition groups and PLL observations
 * - Observation color layout mappings
 * - All immutable reference data
 *
 * No feature should import directly from domain submodules. Use this barrel export only.
 */

export * from './catalogs';
