import { describe, expect, it, vi } from 'vitest';

const fabric = vi.hoisted((): { instance: unknown } => ({ instance: null }));

vi.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  getPublicInstanceFromInternalInstanceHandle: () => fabric.instance,
}));

const { hostBox } = await import('./host-box');

const host = { tag: 5, child: null, sibling: null };
const component = { tag: 0, child: { tag: 7, child: host, sibling: null }, sibling: null };

describe('a box under Fabric', () => {
  it('is null when the renderer has no instance for the host', () => {
    fabric.instance = null;

    expect(hostBox(component)).toBeNull();
  });

  it('is null when the instance cannot measure itself', () => {
    fabric.instance = { measure: () => null };

    expect(hostBox(component)).toBeNull();
  });

  it('is null for a component that draws no host element', () => {
    fabric.instance = { getBoundingClientRect: () => ({ x: 0, y: 0, width: 1, height: 1 }) };

    expect(hostBox({ tag: 0, child: null, sibling: null })).toBeNull();
  });

  it('is the rectangle the instance reports', () => {
    fabric.instance = {
      getBoundingClientRect: () => ({ x: 1, y: 2, width: 3, height: 4, top: 2 }),
    };

    expect(hostBox(component)).toEqual({ x: 1, y: 2, width: 3, height: 4 });
  });
});
