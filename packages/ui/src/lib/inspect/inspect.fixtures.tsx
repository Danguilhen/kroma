import { Component, type ReactNode } from 'react';
import { committedTree, type Fiber, fiberOfInstance } from './react-fiber';
import type { KitNode } from './screen-tree';

/** Every node as the path of names that leads to it, `Dialog.Root/Dialog.Footer`. */
export function paths(nodes: readonly KitNode[], prefix = ''): string[] {
  return nodes.flatMap((node) => {
    const path = `${prefix}${node.name}`;
    return [path, ...paths(node.children, `${path}/`)];
  });
}

/** A class component a test mounts to reach the committed tree it sits in. */
export class TreeProbe extends Component<{ children?: ReactNode }> {
  tree(): Fiber | null {
    const fiber = fiberOfInstance(this);
    return (fiber && committedTree(fiber)?.current) ?? null;
  }

  render(): ReactNode {
    return this.props.children;
  }
}

/** A stand-in for a native-only component a test cannot load. */
export function Nothing(): null {
  return null;
}
