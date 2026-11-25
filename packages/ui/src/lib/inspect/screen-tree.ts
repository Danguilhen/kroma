import { type HostBox, hostBox } from './host-box';
import type { KitNames } from './kit-names';
import { type PropSummary, summarizeProps } from './prop-summary';
import { childOf, componentOf, type Fiber, isHidden, propsOf, siblingOf } from './react-fiber';

/** A mounted kit component: its public name, its props, its box, and the kit
 *  components under it. */
export type KitNode = {
  name: string;
  props: PropSummary;
  box: HostBox | null;
  children: KitNode[];
};

/** The kit components of every mounted root, and how many fibers were read. */
export type ScreenTree = { fibers: number; nodes: KitNode[] };

type Visit = { fiber: Fiber; into: KitNode[] };

function nodeOf(fiber: Fiber, names: KitNames): KitNode | null {
  const name = names.get(componentOf(fiber));
  if (name === undefined) {
    return null;
  }
  return { name, props: summarizeProps(propsOf(fiber)), box: hostBox(fiber), children: [] };
}

function push(pending: Visit[], fiber: Fiber | null, into: KitNode[]): void {
  if (fiber) {
    pending.push({ fiber, into });
  }
}

/** Walks each committed tree once, depth first, keeping only named kit components. */
export function readScreen(trees: Iterable<Fiber>, names: KitNames): ScreenTree {
  const nodes: KitNode[] = [];
  const pending: Visit[] = [];
  for (const tree of trees) {
    push(pending, tree, nodes);
  }
  pending.reverse();
  let fibers = 0;
  for (let visit = pending.pop(); visit; visit = pending.pop()) {
    fibers += 1;
    const { fiber, into } = visit;
    push(pending, siblingOf(fiber), into);
    if (isHidden(fiber)) {
      continue;
    }
    const node = nodeOf(fiber, names);
    if (node) {
      into.push(node);
    }
    push(pending, childOf(fiber), node ? node.children : into);
  }
  return { fibers, nodes };
}
