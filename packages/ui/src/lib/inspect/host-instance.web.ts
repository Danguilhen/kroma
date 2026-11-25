import { type Fiber, hostNodeOf } from './react-fiber';

/** The element a host fiber drew: on the web, the DOM element itself. */
export function hostInstance(fiber: Fiber): unknown {
  return hostNodeOf(fiber);
}
