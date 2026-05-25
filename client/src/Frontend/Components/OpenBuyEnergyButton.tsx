import { LocationId } from '@dfares/types';
import React, { useCallback } from 'react';
import { BuyEnergyPane, BuyEnergyPaneHelpContent } from '../Panes/BuyEnergyPane';
import { TOGGLE_BUY_ENERGY_PANE } from '../Utils/ShortcutConstants';
import { ModalHandle } from '../Views/ModalPane';
import { MaybeShortcutButton } from './MaybeShortcutButton';

const BUY_ENERGY_MODAL_WIDTH = '480px';

export function OpenBuyEnergyButton({
  modal,
  planetId,
}: {
  modal: ModalHandle;
  planetId: LocationId | undefined;
}) {
  const title = 'Buy Energy';
  const shortcut = TOGGLE_BUY_ENERGY_PANE;

  const open = useCallback(() => {
    modal.push({
      title,
      width: BUY_ENERGY_MODAL_WIDTH,
      element: () => <BuyEnergyPane modal={modal} initialPlanetId={planetId} />,
      helpContent: BuyEnergyPaneHelpContent(),
    });
  }, [modal, planetId]);

  return (
    <MaybeShortcutButton
      size='stretch'
      onClick={open}
      onShortcutPressed={open}
      shortcutKey={shortcut}
      shortcutText={shortcut}
    >
      {title}
    </MaybeShortcutButton>
  );
}
