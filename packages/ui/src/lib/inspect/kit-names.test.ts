import { memo } from 'react';
import { describe, expect, it } from 'vitest';
import { kitNames } from './kit-names';

const garbage = () => null;
const Item = () => null;
const Badge = memo(() => null);

describe('the name table', () => {
  it('names a component by its export, whatever the function calls itself', () => {
    const names = kitNames({ Pill: garbage });

    expect(garbage.name).toBe('garbage');
    expect(names.get(garbage)).toBe('Pill');
  });

  it('names a memo object by reference', () => {
    const names = kitNames({ Badge });

    expect(names.get(Badge)).toBe('Badge');
  });

  it('names the parts of a plain object as Export.Key', () => {
    const names = kitNames({ Menu: { Root: Badge, Item } });

    expect(names.get(Badge)).toBe('Menu.Root');
    expect(names.get(Item)).toBe('Menu.Item');
  });

  it('prefers the compound name over a flat export of the same function, in either order', () => {
    expect(kitNames({ Item, Menu: { Item } }).get(Item)).toBe('Menu.Item');
    expect(kitNames({ Menu: { Item }, Item }).get(Item)).toBe('Menu.Item');
  });

  it('ignores values that are not components', () => {
    const names = kitNames({ TOKENS: { gap: 4, ink: '#fff' }, LIMIT: 3, Tones: ['a'] });

    expect(names.size).toBe(0);
  });
});
