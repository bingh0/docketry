// The eight feature files under features/ are the spec. Two are bound; the
// other six are held in the wip register until their steps land.
import { runFeatures } from 'gherkin-node-test/vitest';
import { definers, FEATURES, WIP } from './steps/registry.ts';

runFeatures(FEATURES, definers, { wip: WIP });
