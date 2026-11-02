import assert from 'node:assert/strict';
import test from 'node:test';
import { repairCollapsedDesktopLayouts, presetGridLayouts, INSURANCE_DEFAULT_LAYOUT } from '../demo/insurer-portal/src/components/insurance/dashboardPresets.ts';

test('recovers a mobile-width desktop layout without changing mobile layouts', () => {
  for (const group of ['summary', 'analytics']) {
    const defaults = presetGridLayouts(INSURANCE_DEFAULT_LAYOUT[group]);
    const collapsed = defaults.lg.map((item, index) => ({ ...item, x: 0, y: index * 8, w: 2 }));
    const saved = { ...defaults, lg: collapsed, md: collapsed, sm: collapsed };
    const repaired = repairCollapsedDesktopLayouts(saved, defaults);
    for (const bp of ['lg', 'md', 'sm']) assert.deepEqual(repaired[bp], defaults[bp]);
    assert.equal(repaired.xs, saved.xs);
    assert.equal(repaired.xxs, saved.xxs);
    assert.equal(saved.lg, collapsed, 'does not mutate browser data');
  }
});

test('preserves valid custom layouts, including stacked full-width panels', () => {
  const defaults = presetGridLayouts(INSURANCE_DEFAULT_LAYOUT.summary);
  for (const width of [4, 12]) {
    const custom = defaults.lg.map((item, index) => ({ ...item, x: 0, y: index * 8, w: width }));
    const saved = { ...defaults, lg: custom };
    assert.equal(repairCollapsedDesktopLayouts(saved, defaults).lg, custom);
  }
});
