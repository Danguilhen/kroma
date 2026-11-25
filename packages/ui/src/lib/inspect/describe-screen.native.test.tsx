// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Text } from '#ui/components/atoms/text';
import { ChoiceList } from '#ui/components/molecules/choice-list';
import { Dialog } from '#ui/components/organisms/dialog';
import { onScreen } from '#ui/testing';
import { paths } from './inspect.fixtures';

const fabric = vi.hoisted((): { asked: object[]; rect: object } => ({
  asked: [],
  rect: { x: 10, y: 20, width: 300, height: 48 },
}));

vi.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  getPublicInstanceFromInternalInstanceHandle: (fiber: object) => {
    fabric.asked.push(fiber);
    return { getBoundingClientRect: () => fabric.rect };
  },
}));

vi.mock('react-native-svg', async () => {
  const { Nothing } = await import('./inspect.fixtures');
  const parts = ['Circle', 'Defs', 'Ellipse', 'G', 'Line', 'LinearGradient', 'Path', 'Polygon'];
  const more = ['Polyline', 'Rect', 'Stop', 'SvgXml'];
  return Object.fromEntries([
    ['default', Nothing],
    ...[...parts, ...more].map((name) => [name, Nothing]),
  ]);
});

vi.mock('@react-native-masked-view/masked-view', () => ({
  default: ({ children }: Readonly<{ children?: ReactNode }>) => children,
}));

const { describeScreen } = await import('./describe-screen');

afterEach(cleanup);

function Settings() {
  return (
    <Dialog.Root open title="Réglages">
      <ChoiceList.Root label="Serveur" value="plex" onValueChange={vi.fn()}>
        <ChoiceList.Item value="plex">
          <ChoiceList.Label>Plex</ChoiceList.Label>
        </ChoiceList.Item>
      </ChoiceList.Root>
      <Dialog.Footer>
        <Text>Pied</Text>
      </Dialog.Footer>
    </Dialog.Root>
  );
}

describe('the screen under Metro resolution', () => {
  it('names compound parts and plain components by the door', () => {
    render(onScreen(<Settings />));

    const found = paths(describeScreen().nodes);

    expect(found).toContain('KitProvider/FocusScope/Dialog.Root');
    expect(found).toContainEqual(
      expect.stringMatching(/Dialog\.Root\/.*Dialog\.Footer\/Box\/Text$/),
    );
    expect(found).toContainEqual(
      expect.stringMatching(/ChoiceList\.Item\/.*ChoiceList\.Label\/Text$/),
    );
  });

  it('asks the renderer for the public instance of the first host fiber and measures it', () => {
    render(onScreen(<Text>Un</Text>));

    const text = describeScreen().nodes[0]?.children[0]?.children[0];

    expect(text?.name).toBe('Text');
    expect(text?.box).toEqual(fabric.rect);
    expect(fabric.asked.every((fiber) => Reflect.get(fiber, 'tag') === 5)).toBe(true);
  });
});
