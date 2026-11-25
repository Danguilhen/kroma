import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { summarizeProps } from './prop-summary';

describe('a prop summary', () => {
  it('keeps primitives as they are', () => {
    expect(summarizeProps({ label: 'Plex', size: 3, open: true, value: null })).toEqual({
      label: 'Plex',
      size: 3,
      open: true,
      value: null,
    });
  });

  it('reduces functions, elements, arrays and objects to a short tag', () => {
    const summary = summarizeProps({
      onPress: () => null,
      children: createElement('span'),
      items: [1, 2, 3],
      style: { gap: 4 },
    });

    expect(summary).toEqual({
      onPress: '[function]',
      children: '[element]',
      items: '[array 3]',
      style: '[object]',
    });
  });

  it('cuts a long string and leaves out an undefined prop', () => {
    const summary = summarizeProps({ title: 'x'.repeat(5000), hint: undefined });

    expect(summary.title).toHaveLength(121);
    expect('hint' in summary).toBe(false);
  });

  it('keeps a bounded number of keys and says how many it dropped', () => {
    const props = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`p${i}`, i]));

    const summary = summarizeProps(props);

    expect(Object.keys(summary)).toHaveLength(25);
    expect(summary['…']).toBe('+76');
  });

  it('survives a round trip through JSON', () => {
    const summary = summarizeProps({ ratio: Number.NaN, big: 10n, key: Symbol('k') });

    expect(JSON.parse(JSON.stringify(summary))).toEqual({
      ratio: 'NaN',
      big: '[bigint]',
      key: '[symbol]',
    });
  });
});
