import { SpaceType } from '@dfares/types';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import styled from 'styled-components';

type Point = Readonly<{
  x: number;
  y: number;
}>;

type Square = Readonly<{
  origin: Point;
  size: number;
}>;

export type SpawnArea = {
  readonly key: string;
  // local point where top left of the map container is (0, 0), and the point is located at the center of drawn square
  readonly point: Point;
  // normalized point where the center of the square container is (0, 0), and point is located at (+-x, +-y).
  readonly normdPoint: Point;
  // scaled up normalized point onto the DF world map
  readonly worldPoint: Point;
  // the square drawn for the spawn point
  readonly square: Square;
  // the space type for this maybe spawn point
  readonly spaceType: SpaceType;
  // allows us to mark the spawn area as invalid, which we will do if spawn takes more than 2min for the given area
  invalid?: true;
};
export interface MiniMapHandle {
  getSelectedSpawnArea(): SpawnArea | undefined;
}

const canvasSize = 600;
const canvasRadius = 300;
const canvasBorderSize = 2;

const dotSize = 5.5;
const stepSize = 10;

const Colors = {
  SquareBackground: '#505050' as const,
  InnerNebulaColor: '#00ADE1' as const, // '#21215d';
  OuterNebulaColor: '#505050' as const, // '#24247d';
  DeepSpaceColor: '#505050' as const, // '#000000';
  CorruptedSpaceColor: '#505050' as const, // '#460046';
  SelectedSpawnArea: '#00FF00' as const,
  Pink: 'rgb(255, 180, 193, 1.0)',
};

const StyledMiniMap = styled.div`
  posistion: relative;
`;

const StyledCoords = styled.div`
  font-size: 20px;
  text-align: center;
  padding: 1em;
`;

function point_on_circle(point: Point, radius: number): boolean {
  return Math.sqrt(point.x ** 2 + point.y ** 2) < radius;
}

function make_mouse_points(areas: SpawnArea[]): Record<string, SpawnArea> {
  const gapWooble = 3;
  const table: Record<string, SpawnArea> = {};
  for (const area of areas) {
    // skip areas marked as invalid
    if (area.invalid) {
      continue;
    }

    const { origin, size } = area.square;
    const startPoint: Point = {
      x: Math.floor(origin.x) - gapWooble,
      y: Math.floor(origin.y) - gapWooble,
    };
    const stopPoint: Point = {
      x: Math.ceil(origin.x + size) + gapWooble,
      y: Math.ceil(origin.y + size) + gapWooble,
    };

    for (let x = startPoint.x; x < stopPoint.x; x++) {
      for (let y = startPoint.y; y < stopPoint.y; y++) {
        const key = `(${x},${y})`;
        table[key] = area;
      }
    }
  }

  return table;
}

function draw(
  ctx: CanvasRenderingContext2D,
  {
    rimRadius,
    radius,
    scaleFactor,
  }: {
    rimRadius: number;
    radius: number;
    scaleFactor: number;
  }
): SpawnArea[] {
  // Draw mini-map background square
  ctx.fillStyle = '#151515';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // draw square pattern background by walking the square containing our circle
  const areas: SpawnArea[] = [];
  for (let x = -(stepSize / Math.PI); x < canvasSize + stepSize; x += stepSize) {
    for (let y = -(stepSize / Math.PI); y < canvasSize + stepSize; y += stepSize) {
      // create background square and draw it
      const square: Square = {
        origin: { x, y },
        size: dotSize,
      };
      ctx.fillStyle = '#505050';
      ctx.fillRect(square.origin.x, square.origin.y, square.size, square.size);

      // create point at the center of the square
      const point: Point = {
        x: x - square.size / 2,
        y: y - square.size / 2,
      };

      // normalize point onto a plane with with 0,0 as center and point can have coords (+-x, +-y)
      const normdPoint: Point = {
        x: point.x - radius,
        y: radius - point.y,
      };

      // skip points outside circle
      if (!point_on_circle(normdPoint, radius)) {
        continue;
      }

      // skip points inside rim
      if (point_on_circle(normdPoint, rimRadius)) {
        continue;
      }

      // map normalized point onto DF world map by scaling it up
      const worldPoint: Point = {
        x: normdPoint.x * scaleFactor,
        y: normdPoint.y * scaleFactor,
      };

      const distFromOrigin = Math.floor(Math.sqrt(worldPoint.x ** 2 + worldPoint.y ** 2));
      const spaceType = df.spaceTypeFromPerlin(
        df.spaceTypePerlin(worldPoint, false),
        distFromOrigin
      );

      areas.push({
        key: `(${point.x},${point.y})`,
        point,
        normdPoint,
        worldPoint,
        square,
        spaceType,
      });
    }
  }

  // draw all the spawn areas that are of the spawnable space type NEBULA
  for (const { square, spaceType } of areas) {
    if (spaceType !== SpaceType.NEBULA) {
      continue;
    }

    ctx.fillStyle = Colors.InnerNebulaColor;
    ctx.fillRect(square.origin.x, square.origin.y, square.size, square.size);
  }

  // TODO: Handle pink and blue zones
  // // draw pink circles
  // for (const { coords, radius: pinkZoneRadius } of Array.from(df.getPinkZones())) {
  //   const normalizeX = normalize(coords.x);
  //   const normalizeY = normalize(coords.y * -1);
  //   // let normalizePinkCircleRadius = radius / radiusNormalized
  //   const normalizePinkCircleRadius = (pinkZoneRadius * radiusNormalized) / radius;

  //   ctx.beginPath();
  //   ctx.arc(normalizeX, normalizeY, normalizePinkCircleRadius, 0, 2 * Math.PI);
  //   // pink color
  //   ctx.strokeStyle = 'rgb(255,180,193,1)';
  //   ctx.lineWidth = 1;
  //   ctx.fill();
  //   ctx.stroke();
  // }

  // // draw blue circles
  // for (const { coords, radius: blueZoneRadius } of Array.from(df.getBlueZones())) {
  //   const normalizeX = normalize(coords.x);
  //   const normalizeY = normalize(coords.y * -1);
  //   const normalizeBlueCircleRadius = (blueZoneRadius * radiusNormalized) / radius;
  //   ctx.beginPath();
  //   ctx.arc(normalizeX, normalizeY, normalizeBlueCircleRadius, 0, 2 * Math.PI);
  //   // blue circle
  //   ctx.strokeStyle = 'rgb(0, 173, 225, 1)';
  //   ctx.fillStyle = 'rgb(0, 173, 225, 0.6)';

  //   ctx.lineWidth = 1;
  //   ctx.fill();
  //   ctx.stroke();
  // }

  return areas;
}

function drawRimCircle(
  ctx: CanvasRenderingContext2D,
  {
    rimRadius,
  }: {
    rimRadius: number;
  }
) {
  const offset = canvasRadius - rimRadius + canvasBorderSize;
  ctx.beginPath();
  ctx.arc(rimRadius + offset, rimRadius + offset, rimRadius, 0, 2 * Math.PI);
  ctx.fillStyle = Colors.Pink;
  ctx.fill();
}

function DFARESLogo({ rimRadius }: { rimRadius: number }) {
  const size = rimRadius * 0.75; // adjust size as needed
  const offset = (canvasSize + canvasBorderSize * 2 - size) / 2;
  return (
    <div
      style={{
        position: 'absolute',
        top: `${offset}px`,
        left: `${offset}px`,
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <img src='../../../../public/DFARESLogo-v3.svg' width={size} height={size} />
    </div>
  );
}

function MiniMapImpl({}, ref: React.Ref<MiniMapHandle>) {
  const canvasRef = useRef(null);
  const [coordsText, setCoordsText] = useState('');
  const [coordsTextColor, setCoordsTextColor] = useState('');

  const MAX_LEVEL_DIST = df.getContractConstants().MAX_LEVEL_DIST[1];

  const worldRadius = df.getWorldRadius();
  const rimRadius = canvasRadius * (MAX_LEVEL_DIST / worldRadius);
  const radius = canvasRadius;
  const scaleFactor = worldRadius / radius;
  let selectedSpawnArea: SpawnArea | undefined = undefined;

  useEffect(() => {
    const canvas = canvasRef.current! as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')! as CanvasRenderingContext2D;
    const spawnAreas: SpawnArea[] = draw(ctx, {
      rimRadius,
      radius,
      scaleFactor,
    }).filter((area) => area.spaceType === SpaceType.NEBULA);
    drawRimCircle(ctx, {
      rimRadius,
    });

    // populate valid mouse points
    let mousePoints: Record<string, SpawnArea> = make_mouse_points(spawnAreas);

    // add mouse move listener
    let timeoutId = 0;
    canvas.addEventListener('mousemove', (event: MouseEvent) => {
      const [x, y] = [event.offsetX, event.offsetY];
      if (!point_on_circle({ x: x - canvasRadius, y: y - canvasRadius }, radius)) {
        setCoordsText('');
        return;
      }

      clearTimeout(timeoutId);
      const key = `(${x},${y})`;
      const area = mousePoints[key];
      if (area) {
        canvas.style.cursor = 'pointer';
        setCoordsTextColor(Colors.InnerNebulaColor);
        setCoordsText(`(${area.worldPoint.x.toFixed(0)}, ${area.worldPoint.y.toFixed(0)})`);
      } else {
        canvas.style.cursor = 'no-drop';
        setCoordsTextColor(Colors.Pink);
        setCoordsText("Can't Spawn Here 😅");
      }

      timeoutId = window.setTimeout(() => {
        if (selectedSpawnArea) {
          setCoordsTextColor(Colors.SelectedSpawnArea);
          setCoordsText(
            `Current selected spawn point: (${selectedSpawnArea.worldPoint.x.toFixed(
              0
            )}, ${selectedSpawnArea.worldPoint.y.toFixed(0)}) 🚀`
          );
        } else {
          setCoordsText('');
        }
      }, 1_000);
    });

    // add mouse click listener
    canvas.addEventListener('click', (event: MouseEvent) => {
      const [x, y] = [event.offsetX, event.offsetY];
      const key = `(${x},${y})`;
      const area = mousePoints[key];

      if (!area) {
        return;
      }

      if (selectedSpawnArea) {
        const { origin, size } = selectedSpawnArea.square;
        ctx.fillStyle = Colors.InnerNebulaColor;
        ctx.fillRect(origin.x, origin.y, size, size);
      }

      const { origin, size } = area.square;
      ctx.fillStyle = Colors.SelectedSpawnArea;
      ctx.fillRect(origin.x, origin.y, size, size);

      selectedSpawnArea = area;

      // make sure rim circle stays on top
      drawRimCircle(ctx, {
        rimRadius,
      });

      setCoordsTextColor(Colors.SelectedSpawnArea);
      setCoordsText(
        `Current selected spawn point: (${selectedSpawnArea.worldPoint.x.toFixed(
          0
        )}, ${selectedSpawnArea.worldPoint.y.toFixed(0)}) 🚀`
      );
    });

    return () => {
      setCoordsText('');
      setCoordsTextColor('');
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      getSelectedSpawnArea: () => selectedSpawnArea,
    }),
    [selectedSpawnArea]
  );

  return (
    <StyledMiniMap>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{
          border: `${canvasBorderSize}px solid ${Colors.Pink}`,
          borderRadius: '50%',
        }}
      />
      <DFARESLogo rimRadius={rimRadius} />
      <StyledCoords
        style={{
          color: coordsTextColor,
        }}
      >
        {coordsText}
      </StyledCoords>
    </StyledMiniMap>
  );
}

export const MiniMap = React.forwardRef<MiniMapHandle | undefined>(MiniMapImpl);
