import { isValidElement } from 'react';

/** One prop as the reader reports it: a primitive, or a short tag for anything else. */
export type PropValue = string | number | boolean | null;

/** A component's props, bounded in keys and in string length, safe to serialise. */
export type PropSummary = Readonly<Record<string, PropValue>>;

const MAX_KEYS = 24;
const MAX_TEXT = 120;

function text(value: string): string {
  return value.length > MAX_TEXT ? `${value.slice(0, MAX_TEXT)}…` : value;
}

function tagOf(value: unknown): string {
  if (typeof value !== 'object' || value === null) {
    return `[${typeof value}]`;
  }
  if (Array.isArray(value)) {
    return `[array ${value.length}]`;
  }
  return isValidElement(value) ? '[element]' : '[object]';
}

function summarize(value: unknown): PropValue | undefined {
  switch (typeof value) {
    case 'undefined':
      return undefined;
    case 'string':
      return text(value);
    case 'number':
      return Number.isFinite(value) ? value : String(value);
    case 'boolean':
      return value;
    default:
      return value === null ? null : tagOf(value);
  }
}

/** Reduces props to at most a few dozen JSON-safe entries. */
export function summarizeProps(props: unknown): PropSummary {
  const summary: Record<string, PropValue> = {};
  if (typeof props !== 'object' || props === null) {
    return summary;
  }
  const keys = Object.keys(props);
  for (const key of keys.slice(0, MAX_KEYS)) {
    const value = summarize(Reflect.get(props, key));
    if (value !== undefined) {
      summary[key] = value;
    }
  }
  if (keys.length > MAX_KEYS) {
    summary['…'] = `+${keys.length - MAX_KEYS}`;
  }
  return summary;
}
