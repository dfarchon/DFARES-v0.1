import { PLANET_CLAIM_MIN_LEVEL } from '@dfares/constants';
import { isLocatable } from '@dfares/gamelogic';
import { isUnconfirmedClaimTx } from '@dfares/serde';
import { LocationId } from '@dfares/types';
import React from 'react';
import { Btn } from '../Components/Btn';
import { EmSpacer } from '../Components/CoreUI';
import { AccountLabel } from '../Components/Labels/Labels';
import { LoadingSpinner } from '../Components/LoadingSpinner';
import { TimeUntil } from '../Components/TimeUntil';
import { usePlanet, usePlayer, useUIManager } from '../Utils/AppHooks';
import { useEmitterValue } from '../Utils/EmitterHooks';
import { ModalHandle } from '../Views/ModalPane';

export function ClaimPlanetPane({
  initialPlanetId,
  modal: _modal,
}: {
  modal: ModalHandle;
  initialPlanetId?: LocationId;
}): React.ReactElement {
  const uiManager = useUIManager();
  const gameManager = uiManager.getGameManager();
  const planetId = useEmitterValue(uiManager.selectedPlanetId$, initialPlanetId);
  const planet = usePlanet(uiManager, planetId).value;
  const player = usePlayer(uiManager);

  if (!planetId || !planet || !isLocatable(planet) || !player.value) return <></>;

  // const isClaimingThisPlanetNow = !!planet?.unconfirmedClaim;
  const isClaimingThisPlanetNow = !!planet?.transactions?.hasTransaction(isUnconfirmedClaimTx);

  const isClaimingNow =
    isClaimingThisPlanetNow ||
    !!gameManager.getGameObjects().transactions.hasTransaction(isUnconfirmedClaimTx);

  const existingClaim = gameManager.getClaimedLocations().get(planetId);
  const claimedByThisPlayer =
    (!!existingClaim && existingClaim.claimer === player.value?.address) ||
    (planet.claimer === player.value?.address && !!planet.claimer);
  const claimedByOtherPlayer = !!existingClaim && existingClaim.claimer !== player.value?.address;
  const planetIsLargeEnough = planet.planetLevel >= PLANET_CLAIM_MIN_LEVEL;
  const planetOwnedByMe = player.value?.address && planet.owner === player.value?.address;

  const nextAvailableClaim = uiManager.getGameManager().getNextClaimAvailableTimestamp();
  const claimCooldownPassed =
    uiManager.getGameManager().getNextClaimAvailableTimestamp() <= Date.now();

  const disableClaimButton =
    !claimCooldownPassed ||
    !planetOwnedByMe ||
    !planetIsLargeEnough ||
    claimedByThisPlayer ||
    isClaimingNow;

  let description = <></>;
  let claimButtonContent = <></>;

  if (!planetOwnedByMe) {
    description = <></>;
  } else if (planet.planetLevel < PLANET_CLAIM_MIN_LEVEL) {
    description = (
      <>
        Unfortunately, you cannot claim it planet because it is below level {PLANET_CLAIM_MIN_LEVEL}
        . Find a bigger planet to claim!
        <EmSpacer height={1} />
      </>
    );
  } else if (claimedByOtherPlayer && existingClaim) {
    description = (
      <>
        This planet is claimed by <AccountLabel ethAddress={existingClaim.claimer} />! You can claim
        it for yourself.
        <EmSpacer height={1} />
      </>
    );
  } else if (claimedByThisPlayer) {
    description = (
      <>
        You've claimed this planet!
        <EmSpacer height={1} />
      </>
    );
  } else if (player.value.lastClaimTimestamp === 0) {
    description = (
      <>
        You haven't claimed a planet yet. Claiming this planet records its distance from the center
        as your claim score.
        <EmSpacer height={1} />
      </>
    );
  } else {
    description = (
      <>
        Claiming this planet can update your claim score, while your regular score still comes from
        withdrawing silver and minting artifacts.
        <EmSpacer height={1} />
      </>
    );
  }

  if (!planetOwnedByMe) {
    claimButtonContent = <>You don't own this planet</>;
  } else if (planet.planetLevel < PLANET_CLAIM_MIN_LEVEL) {
    claimButtonContent = <>Too Small</>;
  } else if (isClaimingNow && !isClaimingThisPlanetNow) {
    claimButtonContent = <>Claiming Other Planet</>;
  } else if (isClaimingNow) {
    claimButtonContent = <LoadingSpinner initialText={'Claiming...'} />;
  } else if (!claimCooldownPassed) {
    claimButtonContent = <>wait!</>;
  } else {
    claimButtonContent = <>Claim Planet</>;
  }

  let cooldownContent = <></>;

  if (!claimCooldownPassed) {
    cooldownContent = (
      <>
        You need to wait <TimeUntil timestamp={nextAvailableClaim} ifPassed={'now!'} /> before
        claiming another planet
        <EmSpacer height={1} />
      </>
    );
  }

  return (
    <>
      Claim score is based on claimed planet distance from the center.
      <EmSpacer height={1} />
      {description}
      {cooldownContent}
      <Btn disabled={disableClaimButton} onClick={() => gameManager.claimLocation(planetId)}>
        {claimButtonContent}
      </Btn>
    </>
  );
}
