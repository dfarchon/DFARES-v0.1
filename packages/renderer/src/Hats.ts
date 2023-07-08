import { ArtifactId, HatType } from '@darkforest_eth/types';

export type Hat = {
  legacy: boolean;
  topLayer: Array<string>;
  bottomLayer: Array<string>;
  // image?: () => Promise<HTMLImageElement>;
};

const URL = 'http://localhost:8081';

const santaHat = {
  legacy: true,
  topLayer: [
    'M252.4,449.8c44.3-1.2,84.2,15.3,97.2,24.6s26.4,31.5,43.9,31.5s39-29.9,39-73.5s-16.6-66.6-35.8-74.7 c-16.3-6.9-20.3-1.9-20.3-1.9s-7.5-7.6-13.5-10.5c-6-2.9-17.1-1.1-17.1-1.1s-6.2-9-16.6-12c-10.4-3-23.1,3-23.1,3s-3.5-6.9-15.9-7.8 c-12.4-0.9-18,4.4-18,4.4s-9.3-8.1-21.4-8.1s-25.6,11.3-25.6,11.3s-10.9-9.2-27.7-4.9s-22.3,14.1-22.3,14.1s-11.5-3.9-26.9,2.9 S129,367.5,129,367.5s-24.1,1.9-37.2,23.9s-10.8,47.2-7.9,60.8c2.8,13.5,14.6,51.1,37.2,52.7C143.6,506.5,172.4,452,252.4,449.8z',
    'M447.2,185.4c-34.7,0-62.8-27.9-62.8-62.4s28.1-62.4,62.8-62.4S510,88.5,510,123S481.9,185.4,447.2,185.4z',
  ],
  bottomLayer: [
    'M115.1,386c0,0-1.2-101.8,33.6-169s75-119.3,159.2-127.8s123.2,11.5,145.2,26.6s-4.3,62.4-31.7,72.7 c-27.5,10.3-43.9,25.4-43.9,78.7s14,101.1,14,101.1l-97,29.7L115.1,386z',
  ],
};

const graduationCap = {
  legacy: true,
  topLayer: [],
  bottomLayer: [
    `M492,267.96c-6,4-201,135-201,135l133-67c0,0,0,46,0,46s2,15-11,24c-37.43,22.63-129.6,92.01-157,101 c-27.84-9.26-119.09-78.04-157-101c-13-9-11-24-11-24s0-46,0-46l133,67c-2.97-6.13-211.75-133.17-209-147 c3.85-8.59,25.87-17.04,33-22c19.74-9.12,194.19-116.35,211-116c37.02,9.94,193.3,109.13,229,126 C493.49,248.86,509.51,255.94,492,267.96z M440,466.96l14-15l14,14v-152l-28,14V466.96z`,
  ],
};

const partyHat = {
  legacy: true,
  topLayer: [
    `M256.19,163.68c-1.99,0-4.77-1.25-6.69-7.2l-6.27-19.42c-0.87-2.71-2.59-4.66-4.84-5.47 c-2.25-0.82-4.81-0.43-7.23,1.08l-17.28,10.85c-5.3,3.33-8.23,2.49-9.75,1.22c-1.53-1.28-2.85-4.02-0.5-9.81l7.69-18.91 c1.07-2.64,1.01-5.23-0.19-7.3c-1.2-2.07-3.41-3.42-6.23-3.82l-20.21-2.8c-6.19-0.86-7.9-3.37-8.25-5.34 c-0.35-1.96,0.4-4.91,5.93-7.83l18.04-9.54c2.52-1.33,4.13-3.36,4.55-5.72c0.42-2.35-0.41-4.81-2.32-6.93l-13.69-15.14 c-4.19-4.63-3.89-7.66-2.89-9.39c1-1.72,3.46-3.51,9.58-2.19l19.95,4.29c2.78,0.6,5.33,0.08,7.16-1.45s2.78-3.95,2.68-6.8 l-0.75-20.39c-0.23-6.25,1.95-8.37,3.82-9.05c1.87-0.68,4.91-0.46,8.74,4.48l12.53,16.11c1.75,2.25,4.03,3.49,6.42,3.49 c2.39,0,4.67-1.24,6.42-3.49l12.53-16.11c3.84-4.93,6.87-5.16,8.74-4.48c1.87,0.68,4.05,2.8,3.82,9.05l-0.75,20.39 c-0.11,2.85,0.84,5.26,2.68,6.8s4.38,2.05,7.16,1.45l19.95-4.28c6.12-1.32,8.58,0.47,9.58,2.19c1,1.72,1.3,4.75-2.89,9.39 l-13.69,15.14c-1.91,2.11-2.74,4.57-2.32,6.93c0.42,2.35,2.03,4.38,4.55,5.72L330,88.94c5.53,2.92,6.27,5.87,5.93,7.83 c-0.34,1.96-2.06,4.48-8.25,5.34l-20.21,2.8c-2.82,0.39-5.04,1.75-6.23,3.82c-1.19,2.07-1.26,4.66-0.19,7.3l7.69,18.91 c2.35,5.79,1.03,8.53-0.5,9.81c-1.53,1.28-4.45,2.11-9.75-1.22l-17.28-10.85c-2.41-1.52-4.98-1.9-7.23-1.08 c-2.24,0.82-3.96,2.76-4.84,5.47l-6.27,19.42C260.96,162.43,258.18,163.68,256.19,163.68z`,
  ],
  bottomLayer: [
    `M411.86,472.67c-16.96,11.97-60.78,35.87-155.26,36c-0.03,0-0.05,0-0.08,0c-0.11,0-0.22,0-0.33,0c-0.11,0-0.22,0-0.33,0 c-0.03,0-0.05,0-0.08,0c-94.49-0.12-138.31-24.03-155.26-36c-17-12-9-40-9-40L255.28,71.41c0.38-1.79,0.58-2.73,0.58-2.73l0.33,0.73 l0.33-0.73c0,0,0.2,0.94,0.58,2.73l163.76,361.27C420.86,432.67,428.86,460.67,411.86,472.67z`,
  ],
};

const fishHat = {
  legacy: true,
  topLayer: [],
  bottomLayer: [
    `M509.8,357.73c-25.01-40.97-57.87-74.99-95.03-98.35c-38.82-24.41-82.6-37.31-126.63-37.31 c-63.13,0-123.8,26.05-172.63,73.73c-27.74-32.76-59.58-57.61-92.9-72.36c-6.17-2.73-13.4-1.3-18.05,3.58s-5.75,12.17-2.73,18.2 l60.43,120.84L1.82,486.91c-3.02,6.04-1.92,13.32,2.73,18.2c3.09,3.23,7.3,4.96,11.58,4.96c2.18,0,4.39-0.45,6.47-1.37 c33.33-14.76,65.17-39.6,92.9-72.36c48.83,47.69,109.5,73.73,172.63,73.73c44.02,0,87.81-12.9,126.63-37.31 c37.16-23.37,70.02-57.38,95.03-98.36C512.92,369.28,512.92,362.84,509.8,357.73L509.8,357.73z M416.13,382.06 c-17.67,0-32-14.33-32-32s14.33-32,32-32s32,14.33,32,32S433.8,382.06,416.13,382.06z`,
  ],
};

const topHat = {
  legacy: true,
  topLayer: [
    `M322.86,380.88c-20.04,2.73-51.69,5.46-67,5.93c-15.31-0.46-46.96-3.2-67-5.93c-22-3-52-17.99-52-17.99v40.99 c20,9,40,15,59,18s45,5,60,5c15,0,41-2,60-5s39-9,59-18v-40.99C374.86,362.89,344.86,377.88,322.86,380.88z`,
  ],
  bottomLayer: [
    `M442.86,373.88c-8,0-37,13-51,13s-17,0-17,0s0-42,1-61s12-86,16-114s11-45,9-53s-38-15-57-19s-69-5-88-5s-69,1-88,5 s-55,11-57,19s5,25,9,53s15,95,16,114s1,61,1,61s-3,0-17,0s-43-13-51-13s-25,2-25,26s39,53,78,76s107,30,134,30s95-7,134-30 s78-52,78-76S450.86,373.88,442.86,373.88z`,
  ],
};

const fez = {
  legacy: true,
  topLayer: [
    `M264.74,171.69c-0.48-0.9-11.93-22.23-29.27-43.41c-24.86-30.35-48.94-44.82-71.58-43 c-24.54,1.97-43.07,9.49-56.66,22.98c-13.08,12.98-21.93,31.52-27.86,58.36c-3.97,17.98-7.84,38.05-11.58,57.46 c-5.22,27.1-10.56,54.85-15.66,73.61c-13.39,2.16-29.11,12.07-37.34,28.6c-11.78,23.68-1.39,45.59,4.41,68.16l0.14,0.57l0.54-0.23 c21.5-8.99,45.24-13.92,57.02-37.6c9.49-19.08,5.92-40.81-2.96-52.08c5.4-19.36,10.64-46.57,16.44-76.69 c3.71-19.26,7.54-39.18,11.45-56.85c9.68-43.77,26.4-60.35,63.91-63.37c14.2-1.13,32.57,11.07,51.73,34.38 c15.97,19.43,26.88,39.72,26.99,39.92c2.99,5.6,9.96,7.72,15.56,4.73C265.61,184.26,267.73,177.29,264.74,171.69z`,
  ],
  bottomLayer: [
    `M388.35,185.37c-6.63-24.88-45.68-30.88-61.48-34.69c-15.62-3.77-45.44-5.94-70.91-5.99l0,0 c-0.15,0-0.3,0-0.44,0c-0.15,0-0.3,0-0.44,0l0,0c-25.47,0.05-55.29,2.22-70.91,5.99c-15.8,3.81-54.85,9.81-61.48,34.69L97.88,450.73 c0,0,0.45,8.35,17.75,21.98c17.3,13.62,61.71,26.56,87.18,30.65c25.05,4.02,34.37,4.74,52.22,4.77c0.01,0,0.02,0,0.03,0 c0.15,0,0.3,0,0.44,0c0.15,0,0.29,0,0.44,0c0.01,0,0.02,0,0.03,0c17.86-0.02,27.18-0.75,52.22-4.77 c25.47-4.09,69.88-17.03,87.18-30.65c17.3-13.62,17.75-21.98,17.75-21.98L388.35,185.37z`,
  ],
};

const chefHat = {
  legacy: true,
  topLayer: [
    `M247.24,400.9c-52.68,0-103.37-11.42-115.76-14.41c0.02,0.41,0.04,0.83,0.06,1.23 c0.54,11.59,1.12,24.38,1.64,35.53c37.23,9.79,78.03,17.74,113.98,17.75c0.02,0,0.04,0,0.07,0c0,0,0.01,0,0.01,0s0.01,0,0.01,0 c0.02,0,0.04,0,0.07,0c36.08-0.01,77.06-8.02,114.4-17.86c0.51-11.13,1.1-23.86,1.63-35.42c0.02-0.44,0.04-0.89,0.06-1.33 C351.8,389.21,300.54,400.9,247.24,400.9z`,
  ],
  bottomLayer: [
    `M424.53,136.11c-6.17-27.2-36.34-46.44-53.17-44.03c-16.83,2.41-26.84,4.81-45.5,17.39l-13.83,56.98l9.33-57.35 c0,0-3-18.69-21.5-35.15c-18.5-16.47-32.11-22.2-52.23-22.2c-0.06,0-0.12,0-0.18,0.01c-0.06,0-0.12-0.01-0.18-0.01 c-20.11,0-33.72,5.74-52.23,22.2c-18.5,16.47-21.5,35.15-21.5,35.15l9.33,57.35l-13.83-56.98c-18.67-12.58-28.67-14.99-45.5-17.39 c-16.83-2.41-47,16.84-53.17,44.03s1.83,50.88,15,70.86c13.17,19.98,25.5,19.24,28.67,22.2c3.17,2.96,2.5,13.14,8.17,49.4 c5.67,36.26,8,80.29,9.33,109.15c1.33,28.86,3,65.12,3,65.12c12.67,16.65,78.67,21.46,112.73,21.46l0.18-0.05l0.18,0.05 c34.06,0,100.06-4.81,112.73-21.46c0,0,1.67-36.26,3-65.12c1.33-28.86,3.67-72.89,9.33-109.15c5.67-36.26,5-46.44,8.17-49.4 c3.17-2.96,15.5-2.22,28.67-22.2C422.69,186.99,430.69,163.31,424.53,136.11z`,
  ],
};

const cowboyHat = {
  legacy: true,
  topLayer: [
    `M373.37,417.1c-0.29,0.01-0.58,0.03-0.88,0.04c-0.99-7.32-2.18-16.22-3.46-25.82 c-19.09,9-99.53,14.89-112.96,14.93c-13.43-0.05-93.87-5.93-112.96-14.93c-1.28,9.6-2.47,18.5-3.46,25.82 c-0.3-0.01-0.59-0.03-0.88-0.04c2.5,1.38,6.06,3.1,10.78,4.87c10.64,3.97,63.3,10.89,105.77,10.99c0.2,0,0.38,0,0.58,0 c0.05,0,0.11,0,0.16,0s0.11,0,0.16,0c0.2,0,0.39,0,0.58,0c42.47-0.1,95.13-7.02,105.77-10.99 C367.31,420.2,370.86,418.48,373.37,417.1z`,
  ],
  bottomLayer: [
    `M497.83,362.57c-1.09-7.45-13.8-10.17-17.44,1.27c-3.63,11.44-28.88,32.51-41.41,39.41c-12.53,6.9-28.88,11.26-55.58,13.26 c-3.11,0.23-6.96,0.44-11.35,0.62c-4.33-32.12-12.67-94.75-14.26-113.32c-2.18-25.34-12.8-87.18-14.17-100.26s-3-34.05-19.89-32.42 c-16.82,1.63-39.34,9.19-67.88,9.26c-28.55-0.07-51.07-7.63-67.88-9.26c-16.89-1.63-18.53,19.34-19.89,32.42 s-11.99,74.92-14.17,100.26c-1.6,18.57-9.93,81.2-14.26,113.32c-4.39-0.18-8.23-0.39-11.35-0.62c-26.7-2-43.05-6.36-55.58-13.26 c-12.53-6.9-37.78-27.97-41.41-39.41c-3.63-11.44-16.35-8.72-17.44-1.27c-1.09,7.45-0.91,11.99,8.35,26.52 c9.26,14.53,14.53,21.43,37.05,45.04c22.52,23.61,69.47,52.62,96.62,59.57c21.69,5.55,67.2,4.48,99.94,3.91 c32.74,0.57,78.24,1.64,99.94-3.91c27.15-6.95,74.1-35.96,96.62-59.57c22.52-23.61,27.79-30.51,37.05-45.04 C498.74,374.56,498.92,370.02,497.83,362.57z`,
  ],
};

const popeHat = {
  legacy: true,
  topLayer: [
    `M322.27,98.33v302.46c0,0,52.48,2.78,87.4-12.39c5.41-21.18,9.81-43.65,11.16-64.26 c4.36-66.47-25.43-147.48-60.66-189.25C349.64,122.41,336.1,109.83,322.27,98.33z`,
    `M189.48,98.33v302.46c0,0-52.48,2.78-87.4-12.39c-5.41-21.18-9.81-43.65-11.16-64.26 c-4.36-66.47,25.43-147.48,60.66-189.25C162.11,122.41,175.66,109.83,189.48,98.33z`,
    `M299.84,242.03h-37.13v-35.75c0-3.76-3.05-6.81-6.81-6.81c-0.01,0-0.01,0-0.02,0c-0.01,0-0.01,0-0.02,0 c-3.76,0-6.81,3.05-6.81,6.81v35.75h-37.13c-3.76,0-6.81,3.05-6.81,6.81s3.05,6.81,6.81,6.81h37.13v89.45 c0,3.76,3.05,6.81,6.81,6.81c0.01,0,0.01,0,0.02,0c0.01,0,0.01,0,0.02,0c3.76,0,6.81-3.05,6.81-6.81v-89.45h37.13 c3.76,0,6.81-3.05,6.81-6.81S303.6,242.03,299.84,242.03z`,
  ],
  bottomLayer: [
    `M360.17,134.89c-35.23-41.76-104.28-84.62-104.31-84.64l0,0l0,0l0,0l0,0c-0.03,0.02-69.09,42.87-104.31,84.64 c-35.24,41.77-65.02,122.78-60.66,189.25s40.32,152.2,40.32,152.2c53.03,13.44,96.44,14.17,124.65,14.17l0,0c0,0,0,0,0,0s0,0,0,0 l0,0c28.21,0,71.62-0.73,124.65-14.17c0,0,35.96-85.73,40.32-152.2S395.41,176.66,360.17,134.89z`,
  ],
};

const squid = {
  legacy: true,
  topLayer: [
    `M212.08,228.16c-14.04,0-25.43-11.38-25.43-25.43s11.38-25.43,25.43-25.43c14.04,0,25.43,11.38,25.43,25.43 S226.13,228.16,212.08,228.16z M331.02,166.3c0-12-9.73-21.72-21.72-21.72c-12,0-21.72,9.73-21.72,21.72 c0,12,9.73,21.72,21.72,21.72C321.29,188.03,331.02,178.3,331.02,166.3z`,
  ],
  bottomLayer: [
    `M444.38,420.37c-4.72,0-25.97,6.36-37.6,4.18s-46.68-31.42-52.49-50.67c0,0,12.35,12.9,40.32,6.9 c27.97-5.99,50.31-20.16,65.02-37.05c14.71-16.89,19.07-27.43,18.89-53.58c-0.18-26.15-11.44-46.5-22.7-60.66 c-11.26-14.17-15.26-18.71-28.88-18.71c-13.62,0-16.53,9.99-16.53,15.98c0,5.99,27.79,32.51,31.06,49.4 c3.27,16.89-24.52,50.31-42.14,51.76c-17.62,1.45-44.13,1.27-55.03-20.16c-10.9-21.43-11.26-37.96-2.18-54.67 c9.08-16.71,46.68-56.67,45.95-81c-0.73-24.34-3.81-49.04-16.89-70.83c-13.08-21.79-31.24-31.42-59.21-42.5 c-27.86-11.03-35.48-8.56-56.12-8.54c-20.64-0.02-28.26-2.5-56.12,8.54c-27.97,11.08-46.13,20.71-59.21,42.5 c-13.08,21.8-16.16,46.5-16.89,70.83c-0.73,24.34,36.87,64.3,45.95,81c9.08,16.71,8.72,33.24-2.18,54.67 c-10.9,21.43-37.41,21.61-55.03,20.16c-17.62-1.45-45.41-34.87-42.14-51.76c3.27-16.89,31.06-43.41,31.06-49.4 c0-5.99-2.91-15.98-16.53-15.98c-13.62,0-17.62,4.54-28.88,18.71c-11.26,14.17-22.52,34.51-22.7,60.66 c-0.18,26.15,4.18,36.69,18.89,53.58c14.71,16.89,37.05,31.06,65.02,37.05c27.97,5.99,40.32-6.9,40.32-6.9 c-5.81,19.25-40.87,48.49-52.49,50.67s-32.87-4.18-37.6-4.18c-4.72,0-16.89-0.73-16.89,18.71s19.62,25.97,39.59,25.97 c19.98,0,46.5-15.62,71.56-25.79c24.21-9.82,89.82-57.94,94.26-61.21c4.44,3.27,70.05,51.39,94.26,61.21 c25.06,10.17,51.58,25.79,71.56,25.79c19.98,0,39.59-6.54,39.59-25.97S449.11,420.37,444.38,420.37z`,
  ],
};

const doge = {
  legacy: false,
  topLayer: [URL + '/img/meme/doge.png'],
  bottomLayer: [],
  // image: () =>
  //   new Promise<HTMLImageElement>((resolve) => {
  //     const img = new Image();
  //     img.src = 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=025';
  //     img.onload = () => resolve(img);
  //   }),
};

const cat = {
  legacy: false,
  topLayer: [URL + '/img/meme/Cat.png'],
  bottomLayer: [],
};

const chunZhen = {
  legacy: false,
  topLayer: [URL + '/img/meme/chunZhen.png'],
  bottomLayer: [],
};

const iKunBird = {
  legacy: false,
  topLayer: [URL + '/img/meme/iKunBird.png'],
  bottomLayer: [],
};

const mike = {
  legacy: false,
  topLayer: [URL + '/img/meme/mike.png'],
  bottomLayer: [],
};

const panda = {
  legacy: false,
  topLayer: [URL + '/img/meme/panda.png'],
  bottomLayer: [],
};

const pepe = {
  legacy: false,
  topLayer: [URL + '/img/meme/pepe.png'],
  bottomLayer: [],
};

const pigMan = {
  legacy: false,
  topLayer: [URL + '/img/meme/pigMan.png'],
  bottomLayer: [],
};

const robotCat = {
  legacy: false,
  topLayer: [URL + '/img/meme/robotCat.png'],
  bottomLayer: [],
};

const taiKuLa = {
  legacy: false,
  topLayer: [URL + '/img/meme/taiKuLa.png'],
  bottomLayer: [],
};

const wojak1 = {
  legacy: false,
  topLayer: [URL + '/img/meme/wojak1.png'],
  bottomLayer: [],
};

const wojak2 = {
  legacy: false,
  topLayer: [URL + '/img/meme/wojak2.png'],
  bottomLayer: [],
};

const wojak3 = {
  legacy: false,
  topLayer: [URL + '/img/meme/wojak3.png'],
  bottomLayer: [],
};

const wojak4 = {
  legacy: false,
  topLayer: [URL + '/img/meme/wojak4.png'],
  bottomLayer: [],
};

const DFArchon = {
  legacy: false,
  topLayer: [URL + '/img/logo/DFArchon.png'],
  bottomLayer: [],
};

const AltLayer = {
  legacy: false,
  topLayer: [URL + '/img/logo/AltLayer.png'],
  bottomLayer: [],
};

const DeGame = {
  legacy: false,
  topLayer: [URL + '/img/logo/DeGame.png'],
  bottomLayer: [],
};

const FunBlocks = {
  legacy: false,
  topLayer: [URL + '/img/logo/FunBlocks.png'],
  bottomLayer: [],
};

const GamePhylum = {
  legacy: false,
  topLayer: [URL + '/img/logo/GamePhylum.png'],
  bottomLayer: [],
};

const MarrowDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/MarrowDAO.png'],
  bottomLayer: [],
};

const OrdenGG = {
  legacy: false,
  topLayer: [URL + '/img/logo/MarrowDAO.png'],
  bottomLayer: [],
};

const DFDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/DFDAO.png'],
  bottomLayer: [],
};

const Two77DAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/277DAO.png'],
  bottomLayer: [],
};

const Web3MQ = {
  legacy: false,
  topLayer: [URL + '/img/logo/Web3MQ.png'],
  bottomLayer: [],
};
const Mask = {
  legacy: false,
  topLayer: [URL + '/img/logo/Mask.svg'],
  bottomLayer: [],
};

const AGLDDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/AGLDDAO.png'],
  bottomLayer: [],
};

const Zero1a1 = {
  legacy: false,
  topLayer: [URL + '/img/logo/01a1.png'],
  bottomLayer: [],
};

const WeirdaoGhostGang = {
  legacy: false,
  topLayer: [URL + '/img/logo/WeirdoGhostGang.png'],
  bottomLayer: [],
};

const Briq = {
  legacy: false,
  topLayer: [URL + '/img/logo/Briq.png'],
  bottomLayer: [],
};

const BlockBeats = {
  legacy: false,
  topLayer: [URL + '/img/logo/BlockBeats.png'],
  bottomLayer: [],
};

const Cointime = {
  legacy: false,
  topLayer: [URL + '/img/logo/Cointime.png'],
  bottomLayer: [],
};

const ChainCatcher = {
  legacy: false,
  topLayer: [URL + '/img/logo/ChainCatcher.png'],
  bottomLayer: [],
};

const ForesightNews = {
  legacy: false,
  topLayer: [URL + '/img/logo/ForesightNews.png'],
  bottomLayer: [],
};

const SeeDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/SeeDAO.png'],
  bottomLayer: [],
};

const AWHouse = {
  legacy: false,
  topLayer: [URL + '/img/logo/AWHouse.png'],
  bottomLayer: [],
};

const PaladinsDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/PaladinsDAO.png'],
  bottomLayer: [],
};

const NetherScape = {
  legacy: false,
  topLayer: [URL + '/img/logo/NetherScape.png'],
  bottomLayer: [],
};

const UpchainDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/UpchainDAO.svg'],
  bottomLayer: [],
};

const LXDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/LXDAO.png'],
  bottomLayer: [],
};

const MatrixWorld = {
  legacy: false,
  topLayer: [URL + '/img/logo/MatrixWorld.png'],
  bottomLayer: [],
};

const CryptoChasers = {
  legacy: false,
  topLayer: [URL + '/img/logo/CryptoChasers.png'],
  bottomLayer: [],
};

const AWResearch = {
  legacy: false,
  topLayer: [URL + '/img/logo/AWResearch.png'],
  bottomLayer: [],
};

const BlockPi = {
  legacy: false,
  topLayer: [URL + '/img/logo/BlockPi.png'],
  bottomLayer: [],
};

const WhaleDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/WhaleDAO.png'],
  bottomLayer: [],
};

const Gametaverse = {
  legacy: false,
  topLayer: [URL + '/img/logo/Gametaverse.png'],
  bottomLayer: [],
};

const BuidlerDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/BuidlerDAO.png'],
  bottomLayer: [],
};

const THUBA = {
  legacy: false,
  topLayer: [URL + '/img/logo/THUBA.png'],
  bottomLayer: [],
};

const NJUBA = {
  legacy: false,
  topLayer: [URL + '/img/logo/NJUBA.png'],
  bottomLayer: [],
};

const RUChain = {
  legacy: false,
  topLayer: [URL + '/img/logo/RUChain.png'],
  bottomLayer: [],
};

const DFARES = {
  legacy: false,
  topLayer: [URL + '/img/logo/DFARES.png'],
  bottomLayer: [],
};

export const hatFromType = (type: HatType): Hat => hats[type];

export const avatarFromArtifactIdAndImageType = (
  id: ArtifactId,
  imageType: number,
  ifRandom: boolean
): HatType => {
  const avatars = [
    HatType.DFARES,
    HatType.Doge,
    HatType.Cat,
    HatType.ChunZhen,
    HatType.IKunBird,
    HatType.Mike,
    HatType.Panda,
    HatType.Pepe,
    HatType.PigMan,
    HatType.RobotCat,
    HatType.TaiKuLa,
    HatType.Wojak1,
    HatType.Wojak2,
    HatType.Wojak3,
    HatType.Wojak4,
    HatType.DFArchon,
    HatType.AltLayer,
    HatType.DeGame,
    HatType.FunBlocks,
    HatType.GamePhylum,
    HatType.MarrowDAO,
    HatType.OrdenGG,
    HatType.DFDAO,
    HatType.Two77DAO,
    HatType.Web3MQ,
    HatType.Mask,
    HatType.AGLDDAO,
    HatType.Zero1a1,
    HatType.WeirdaoGhostGang,
    HatType.Briq,
    HatType.BlockBeats,
    HatType.Cointime,
    HatType.ChainCatcher,
    HatType.ForesightNews,
    HatType.SeeDAO,
    HatType.AWHouse,
    HatType.PaladinsDAO,
    HatType.NetherScape,
    HatType.UpchainDAO,
    HatType.LXDAO,
    HatType.MatrixWorld,
    HatType.CryptoChasers,
    HatType.AWResearch,
    HatType.BlockPi,
    HatType.WhaleDAO,
    HatType.Gametaverse,
    HatType.BuidlerDAO,
    HatType.THUBA,
    HatType.NJUBA,
    HatType.RUChain,
    HatType.DFARES,
  ];
  if (ifRandom) return avatars[parseInt(id.substring(id.length - 2), 16) % avatars.length];
  else return avatars[parseInt(imageType.toString()) % avatars.length];
};

export const hats: Record<HatType, Hat> = {
  [HatType.GraduationCap]: graduationCap,
  [HatType.PartyHat]: partyHat,
  [HatType.Fish]: fishHat,
  [HatType.TopHat]: topHat,
  [HatType.Fez]: fez,
  [HatType.ChefHat]: chefHat,
  [HatType.CowboyHat]: cowboyHat,
  [HatType.PopeHat]: popeHat,
  [HatType.Squid]: squid,
  [HatType.SantaHat]: santaHat,
  [HatType.Doge]: doge,
  [HatType.Cat]: cat,
  [HatType.ChunZhen]: chunZhen,
  [HatType.IKunBird]: iKunBird,
  [HatType.Mike]: mike,
  [HatType.Panda]: panda,
  [HatType.Pepe]: pepe,
  [HatType.PigMan]: pigMan,
  [HatType.RobotCat]: robotCat,
  [HatType.TaiKuLa]: taiKuLa,
  [HatType.Wojak1]: wojak1,
  [HatType.Wojak2]: wojak2,
  [HatType.Wojak3]: wojak3,
  [HatType.Wojak4]: wojak4,
  [HatType.DFArchon]: DFArchon,
  [HatType.AltLayer]: AltLayer, // 'AltLayer',
  [HatType.DeGame]: DeGame, //'DeGame',
  [HatType.FunBlocks]: FunBlocks, //'Fun Blocks',
  [HatType.GamePhylum]: GamePhylum, //'GamePhylum',
  [HatType.MarrowDAO]: MarrowDAO, //'MarrowDAO|Guild W',
  [HatType.OrdenGG]: OrdenGG, //'Orden GG',
  [HatType.DFDAO]: DFDAO, //'DFDAO',
  [HatType.Two77DAO]: Two77DAO, //'277 DAO',
  [HatType.Web3MQ]: Web3MQ, //'Web3MQ',
  [HatType.Mask]: Mask, //'Mask Network',
  [HatType.AGLDDAO]: AGLDDAO, // 'AGLD DAO',
  [HatType.Zero1a1]: Zero1a1, //'01a1',
  [HatType.WeirdaoGhostGang]: WeirdaoGhostGang, //'Weirdao Ghost Gang',
  [HatType.Briq]: Briq, //'Briq',
  [HatType.BlockBeats]: BlockBeats, //'BlockBeats',
  [HatType.Cointime]: Cointime, //'Cointime',
  [HatType.ChainCatcher]: ChainCatcher, //'ChainCatcher',
  [HatType.ForesightNews]: ForesightNews, //'ForesightNews',
  [HatType.SeeDAO]: SeeDAO, //'SeeDAO',
  [HatType.AWHouse]: AWHouse, //'AWHouse',
  [HatType.PaladinsDAO]: PaladinsDAO, //'PaladinsDAO',
  [HatType.NetherScape]: NetherScape, // 'NetherScape',
  [HatType.UpchainDAO]: UpchainDAO, //'UpchainDAO',
  [HatType.LXDAO]: LXDAO, // 'LXDAO',
  [HatType.MatrixWorld]: MatrixWorld, //'Matrix World',
  [HatType.CryptoChasers]: CryptoChasers, //'Crypto Chasers',
  [HatType.AWResearch]: AWResearch, //'AW Research',
  [HatType.BlockPi]: BlockPi, //'BlockPi',
  [HatType.WhaleDAO]: WhaleDAO, //'WhaleDAO',
  [HatType.Gametaverse]: Gametaverse, //'Gametaverse',
  [HatType.BuidlerDAO]: BuidlerDAO, //'BuidlerDAO',
  [HatType.THUBA]: THUBA, //'THUBA',
  [HatType.NJUBA]: NJUBA, // 'NJUBA',
  [HatType.RUChain]: RUChain, // 'RUChain',
  [HatType.DFARES]: DFARES, // 'RUChain',
};
