/** A component reference and the name the kit's door gives it. */
export type KitNames = ReadonlyMap<unknown, string>;

function isComponent(value: unknown): boolean {
  if (typeof value === 'function') {
    return true;
  }
  return typeof value === 'object' && value !== null && '$$typeof' in value;
}

function isCompound(value: unknown): value is object {
  return (
    typeof value === 'object' &&
    value !== null &&
    !('$$typeof' in value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

/**
 * Names every component a door exports: a component by its export, a plain
 * object of components by `<Export>.<Key>`. A component reachable both ways
 * keeps its compound name.
 */
export function kitNames(door: Readonly<Record<string, unknown>>): KitNames {
  const names = new Map<unknown, string>();
  const entries = Object.entries(door);
  for (const [name, value] of entries) {
    if (isComponent(value)) {
      names.set(value, name);
    }
  }
  for (const [name, value] of entries) {
    if (!isCompound(value)) {
      continue;
    }
    for (const [key, part] of Object.entries(value)) {
      if (isComponent(part)) {
        names.set(part, `${name}.${key}`);
      }
    }
  }
  return names;
}
