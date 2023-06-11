import {
  ArtifactType,
  LinkRendererType,
  LocationId,
  RendererType,
  RenderZIndex,
} from '@darkforest_eth/types';
import { engineConsts } from '../EngineConsts';
import { Renderer } from '../Renderer';
import { GameGLManager } from '../WebGL/GameGLManager';
const { purpleA, blueA } = engineConsts.colors;

export class LinkRenderer implements LinkRendererType {
  renderer: Renderer;

  rendererType = RendererType.Link;

  constructor(gl: GameGLManager) {
    this.renderer = gl.renderer;
  }

  queueLinks() {
    const { context: gameUIManager } = this.renderer;

    for (const unconfirmedLink of gameUIManager.getUnconfirmedLinkActivations()) {
      if (unconfirmedLink.intent.linkTo)
        this.drawVoyagePath(
          unconfirmedLink.intent.locationId,
          unconfirmedLink.intent.linkTo,
          false
        );
    }

    for (const link of gameUIManager.getLinks()) {
      this.drawVoyagePath(link.from, link.to, true);
    }
  }

  private drawVoyagePath(from: LocationId, to: LocationId, confirmed: boolean) {
    const { context: gameUIManager } = this.renderer;

    const fromLoc = gameUIManager.getLocationOfPlanet(from);
    const fromPlanet = gameUIManager.getPlanetWithId(from);
    const toLoc = gameUIManager.getLocationOfPlanet(to);
    const toPlanet = gameUIManager.getPlanetWithId(to);

    if (!fromPlanet || !fromLoc || !toLoc || !toPlanet) {
      return;
    }

    const artifact = gameUIManager.getActiveArtifact(fromPlanet);

    if (!artifact) {
      return;
    }

    let lineColor = purpleA;

    if (artifact.artifactType === ArtifactType.IceLink) {
      lineColor = blueA;
    }

    this.renderer.lineRenderer.queueLineWorld(
      fromLoc.coords,
      toLoc.coords,
      lineColor,
      confirmed ? 2 : 1,
      RenderZIndex.Voyages,
      confirmed ? false : true
    );
  }

  // eslint-disable-next-line
  flush() {}
}
