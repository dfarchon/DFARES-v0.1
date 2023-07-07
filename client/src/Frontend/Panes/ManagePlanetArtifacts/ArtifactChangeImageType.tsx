import { isUnconfirmedChangeArtifactImageTypeTx } from '@darkforest_eth/serde';
import {
  Artifact,
  ArtifactId,
  ArtifactType,
  HatType,
  LocationId,
  Planet,
} from '@darkforest_eth/types';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Btn } from '../../Components/Btn';
import { SelectFrom } from '../../Components/CoreUI';
import { useAccount, useArtifact, usePlanet, useUIManager } from '../../Utils/AppHooks';

const StyledBuyArtifactPane = styled.div`
  & > div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    &:last-child > span {
      margin-top: 1em;
      text-align: center;
      flex-grow: 1;
    }

    &.margin-top {
      margin-top: 0.5em;
    }
  }
`;

export function ArtifactChangeImageType({
  artifactId,
  depositOn,
}: {
  artifactId: ArtifactId;
  depositOn?: LocationId;
}) {
  const uiManager = useUIManager();
  const account = useAccount(uiManager);
  const artifactWrapper = useArtifact(uiManager, artifactId);
  const artifact = artifactWrapper.value;

  const depositPlanetWrapper = usePlanet(uiManager, depositOn);
  const onPlanetWrapper = usePlanet(uiManager, artifact?.onPlanetId);
  const depositPlanet = depositPlanetWrapper.value;
  const onPlanet = onPlanetWrapper.value;

  // const otherArtifactsOnPlanet = usePlanetArtifacts(onPlanetWrapper, uiManager);

  const [imageType, setImageType] = useState(HatType.Doge.toString());

  if (!artifact || (!onPlanet && !depositPlanet) || !account) return null;

  if (!onPlanet) return null;

  const canArtifactChangeImageType = (artifact: Artifact) =>
    artifact.artifactType === ArtifactType.Avatar;

  const imageTypeChangeing = artifact.transactions?.hasTransaction(
    isUnconfirmedChangeArtifactImageTypeTx
  );

  const enabled = (planet: Planet): boolean => !imageTypeChangeing && planet?.owner === account;

  // MyTodo: make more show state
  // const canHandleImageTypeChange = depositPlanetWrapper.value && ;

  return (
    <div>
      {canArtifactChangeImageType(artifact) && (
        <StyledBuyArtifactPane>
          <div>
            <div> Image Type </div>
            <SelectFrom
              values={[
                // HatType.DFARES.toString(),
                // HatType.Doge.toString(),
                // HatType.Cat.toString(),
                // HatType.ChunZhen.toString(),
                // HatType.IKunBird.toString(),
                // HatType.Mike.toString(),
                // HatType.Panda.toString(),
                // HatType.Pepe.toString(),
                // HatType.PigMan.toString(),
                // HatType.RobotCat.toString(),
                // HatType.TaiKuLa.toString(),
                // HatType.Wojak1.toString(),
                // HatType.Wojak2.toString(),
                // HatType.Wojak3.toString(),
                // HatType.Wojak4.toString(),
                // HatType.Mask.toString(),
                // HatType.Web3MQ.toString(),
                '0',
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '10',
                '11',
                '12',
                '13',
                '14',
                '15',
                '16',
                '17',
                '18',
                '19',
                '20',
                '21',
                '22',
                '23',
                '24',
                '25',
                '26',
                '27',
                '28',
                '29',
                '30',
                '31',
                '32',
                '33',
                '34',
                '35',
              ]}
              labels={[
                'DF ARES',
                'Doge',
                'Cat',
                'ChunZhen',
                'IKunBird',
                'Mike',
                'Panda',
                'Pepe',
                'PigMan',
                'RobotCat',
                'TaiKuLa',
                'Wojak1',
                'Wojak2',
                'Wojak3',
                'Wojak4',
                '01a1',
                'AGLD DAO',
                'AltLayer',
                'Dark Forest',
                'DF ARES',
                'DFDAO',
                'Kawaii Doge',
                'Mask Network',
                'NetherScape',
                'Orden GG',
                'Web3MQ',
              ]}
              value={imageType.toString()}
              setValue={setImageType}
            />
          </div>
          <div>
            <Btn
              onClick={() => {
                if (!enabled(onPlanet) || !uiManager || !onPlanet) return;

                uiManager.changeArtifactImageType(
                  onPlanet.locationId,
                  artifact.id,
                  Number(imageType)
                );
              }}
              disabled={!enabled(onPlanet)}
            >
              Set Image Type
            </Btn>
          </div>
        </StyledBuyArtifactPane>
      )}
    </div>
  );
}
