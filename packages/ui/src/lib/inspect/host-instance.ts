import * as renderer from 'react-native/Libraries/ReactNative/RendererProxy';
import type { Fiber } from './react-fiber';

/** The element a host fiber drew: under Fabric, the `ReactNativeElement` the
 *  renderer creates on first ask, which answers `getBoundingClientRect()`. */
export function hostInstance(fiber: Fiber): unknown {
  const resolve: unknown = Reflect.get(renderer, 'getPublicInstanceFromInternalInstanceHandle');
  return typeof resolve === 'function' ? resolve(fiber) : null;
}
