class MinimapSpawnPlugin {
  constructor() {
    this.minDensity = 1000;
    this.maxDensity = 10000;
    this.selectedCoords = { x: 0, y: 0 }; // Initial coordinates
    this.canvas = document.createElement('canvas');

    this.clickOccurred = false;
  }

  async render(div) {
    // Default values

    div.style.width = '400px';
    div.style.height = '180px';
    div.style.maxWidth = '1200px';
    div.style.maxHeight = '1200px';

    const radius = ui.getWorldRadius();
    let step = 1800;
    let dot = 4;
    let canvasSize = 400;
    let sizeFactor = 500;

    // Utility functions
    console.log('Current game radius:', radius);
    const normalize = (val) => {
      return Math.floor(((val + radius) * sizeFactor) / (radius * 2));
    };

    const checkBounds = (a, b, x, y, r) => {
      let dist = (a - x) * (a - x) + (b - y) * (b - y);
      r *= r;
      return dist < r;
    };

    // UI elements

    // Sample points in a grid and determine space type

    const generate = () => {
      div.style.width = '100%';
      div.style.height = '100%';
      this.canvas.width = canvasSize;
      this.canvas.height = canvasSize;
      sizeFactor = canvasSize - 20;
      let data = [];

      // Generate x coordinates
      for (let i = radius * -1; i < radius; i += step) {
        // Generate y coordinates
        for (let j = radius * -1; j < radius; j += step) {
          // Filter points within map circle
          if (checkBounds(0, 0, i, j, radius)) {
            // Store coordinate and space type
            data.push({
              x: i,
              y: j,
              type: df.spaceTypeFromPerlin(df.spaceTypePerlin({ x: i, y: j })),
            });
          }
        }
      }

      // Draw mini-map

      const ctx = this.canvas.getContext('2d');

      for (let i = 0; i < data.length; i++) {
        if (data[i].type === 0) {
          ctx.fillStyle = '#21215d'; // Inner nebula
        } else if (data[i].type === 1) {
          ctx.fillStyle = '#24247d'; // Outer nebula
        } else if (data[i].type === 2) {
          ctx.fillStyle = '#000000'; // Deep space
        } else if (data[i].type === 3) {
          ctx.fillStyle = '#460046'; // Corrupted slightly brighter for better visibility
        }
        ctx.fillRect(normalize(data[i].x) + 10, normalize(data[i].y * -1) + 10, dot, dot);
      }

      // Recenter viewport based on click location

      this.canvas.style = 'cursor: pointer;';

      // draw extents of map

      let radiusNormalized = normalize(radius) / 2;

      ctx.beginPath();
      ctx.arc(radiusNormalized + 12, radiusNormalized + 12, radiusNormalized, 0, 2 * Math.PI);
      ctx.strokeStyle = '#DDDDDD';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    generate();
    div.appendChild(this.canvas);
  }

  destroy() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  async runAndGetUserCoords() {
    // Create an object to store selected coordinates
    let selectedCoords = { x: 0, y: 0 };

    const radius = ui.getWorldRadius();
    const rim = df.getContractConstants().SPAWN_RIM_AREA;
    let sizeFactor = 500;

    const toWorldCoord = (val) => {
      return Math.floor((val * radius * 2) / sizeFactor - radius);
    };
    // Add a click event listener to the canvas
    this.canvas.addEventListener(
      'click',
      (event) => {
        let x = event.offsetX;
        let y = event.offsetY;
        let xWorld = toWorldCoord(x);
        let yWorld = toWorldCoord(y) * -1;

        selectedCoords = { x: xWorld, y: yWorld };
        console.log(`[${xWorld}, ${yWorld}]`);

        this.clickOccurred = true;
      },
      false
    );

    // Wait for the click event to occur
    while (!this.clickOccurred) {
      // Use a synchronous delay to avoid blocking the main thread
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Return the selected coordinates
    return selectedCoords;
  }

  toWorldCoord(val) {
    const radius = ui.getWorldRadius();
    let sizeFactor = 500;
    return Math.floor((val * radius * 2) / sizeFactor - radius);
  }
}

export default MinimapSpawnPlugin;
