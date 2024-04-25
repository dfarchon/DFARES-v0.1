import { PICTURE_URL } from '@dfares/constants';
import { LogoType } from '@dfares/types';

export type Logo = {
  legacy: boolean;
  topLayer: Array<string>;
  bottomLayer: Array<string>;
  color: string;
  desc: string;
  website: string;
  // image?: () => Promise<HTMLImageElement>;
};

const URL = PICTURE_URL;

//1
const DF = {
  legacy: false,
  topLayer: [URL + '/img/logo/DF.png'],
  bottomLayer: [],
  // image: () =>
  //   new Promise<HTMLImageElement>((resolve) => {
  //     const img = new Image();
  //     img.src = 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=025';
  //     img.onload = () => resolve(img);
  //   }),
  name: 'Dark Forest',
  desc: 'Dark Forest is an MMO strategy game built with zkSNARKs on Gnosis Chain (formerly xDai). \
  Players explore an infinite, procedurally-generated universe, conquering planets and growing a space empire.',
  color: '#06fc1a',
  website: 'https://twitter.com/darkforest_eth',
};
//2
const Lattice = {
  legacy: false,
  topLayer: [URL + '/img/logo/Lattice.png'],
  bottomLayer: [],
  name: 'Lattice',
  desc: 'Lattice is an engineering and product focused company pushing the limits of Ethereum applications and infrastructure. \
  They are building MUD, Redstone, and Sky Strife.',
  color: '#5c9af6',
  website: 'https://lattice.xyz/',
};

//3
const Redstone = {
  legacy: false,
  topLayer: [URL + '/img/logo/Redstone.png'],
  bottomLayer: [],
  name: 'Redstone',
  desc: 'Redstone runs applications on an OP Stack chain optimized for games,\
   autonomous worlds, and other ambitious onchain applications.',
  color: '#f34242',
  website: 'https://redstone.xyz/',
};

//4
const Mud = {
  legacy: false,
  topLayer: [URL + '/img/logo/Mud.png'],
  bottomLayer: [],
  name: 'MUD',
  desc: 'MUD provides you with the tools to build ambitious onchain applications.',
  color: '#ff7612',
  website: 'https://mud.dev/',
};

//5
const Biomes = {
  legacy: false,
  topLayer: [URL + '/img/logo/Biomes.png'],
  bottomLayer: [],
  name: 'Biomes',
  desc: 'Create and Play Onchain Biomes.',
  color: '#42a232',
  website: 'https://twitter.com/biomesAW',
};

//6
const ThisCursedMachine = {
  legacy: false,
  topLayer: [URL + '/img/logo/MovingCastles.png'],
  bottomLayer: [],
  name: 'Moving Castles',
  desc: 'Game studio for the tactical research and development of autonomous worlds.',
  color: 'white',
  website: 'https://twitter.com/movingcastles_/',
};

//7
const SkyStrife = {
  legacy: false,
  topLayer: [URL + '/img/logo/SkyStrife.png'],
  bottomLayer: [],
  name: 'Sky Strife',
  desc: 'The free-to-play, fully onchain real-time strategy game.',
  color: 'white',
  website: 'https://www.skystrife.xyz/',
};

// 8
const SmallBrainGames = {
  legacy: false,
  topLayer: [URL + '/img/logo/SmallBrain.png'],
  bottomLayer: [],
  name: 'Small Brain Games',
  desc: 'Building a new on-chain game every 6 weeks.',
  color: 'white',
  website: 'https://twitter.com/0xsmallbrain',
};

//9
const DownStream = {
  legacy: false,
  topLayer: [URL + '/img/logo/DownStream.png'],
  bottomLayer: [],
  name: 'DownStream',
  desc: "Help a super intelligent AI rebuild after an unfortunate accident. The world's first Post Singularity Civilisation Simulator, by @PlaymintUK",
  color: '#fb7001',
  website: 'https://twitter.com/DownstreamGame',
};

//10
const Dear = {
  legacy: false,
  topLayer: [URL + '/img/logo/Dear.png'],
  bottomLayer: [],
  name: 'Dear',
  desc: 'Hold a Token of Emotion in your wallet to start interacting.',
  color: 'white',
  website: 'https://twitter.com/dear_dyr',
};

//11
const DFARES = {
  legacy: false,
  topLayer: [URL + '/img/logo/DFARES.png'],
  bottomLayer: [],
  name: 'Dark Forest Ares',
  desc: 'Dark Forest Ares is a series of Dark Forest community rounds hosted by the DF Archon team. \
   We hope to develop and explore new game mechanics whilst maintaining the original style and excitement of Dark Forest. ',
  color: 'pink',
  website: 'https://dfares.xyz/',
};

//12
const PixeLAW = {
  legacy: false,
  topLayer: [URL + '/img/logo/PixeLAW.png'],
  bottomLayer: [],
  name: 'PixeLAW',
  desc: 'A pixel-based Autonomous World.',
  color: 'white',
  website: 'https://pixelaw.xyz/',
};

//13
const GGQuest = {
  legacy: false,
  topLayer: [URL + '/img/logo/ggQuest.png'],
  name: 'GGQuest',
  desc: 'GGQuest is the ultimate on-chain progression system for gamers. \
  We track & aggregate all gaming-related data across various platforms & \
  ecosystems and showcase them under one unified dashboard- Quest ID.\
   This can help build reputation & unlock personalized gaming experiences.',
  color: '#fff',
  bottomLayer: [],
  website: '',
};

//14
const DFArchon = {
  legacy: false,
  topLayer: [URL + '/img/logo/DFArchon.png'],
  bottomLayer: [],
  name: 'DF Archon',
  desc: "DF Archon is a development team focused on fully on-chain game, \
    working on a more user-friendly gaming environment. \
    In Dark Forest ecosystem, we've built quite a few of cool projects: \
    DF GAIA,\
    DF ARTEMIS , DF APOLLO.\
   We also pay close attention to other on-chain game projects or teams, \
    prepare to work on top of those projects as well.",
  color: 'pink',
  website: 'https://twitter.com/DFArchon',
};

//15
const Mask = {
  legacy: false,
  topLayer: [URL + '/img/logo/Mask.svg'],
  bottomLayer: [],
  name: 'Mask Network',
  desc: 'Mask Network brings privacy and benefits from Web3 to social media like Facebook & Twitter - with an open-sourced browser extension.',
  color: '#1FB3FB',
  website: 'https://twitter.com/realMaskNetwork',
};

//16
const AGLDDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/AGLDDAO.png'],
  bottomLayer: [],
  name: 'AGLD DAO',
  desc: 'AGLD DAO is committed to building Autonomous Worlds that embody the principles of decentralization, \
  transparency, fairness, and most importantly community sovereignty. The Loot Chain is designed to be a home for\
   builders in the Lootverse. It will become the go-to place for building new games, tools, and worlds within the Lootverse.',
  color: '#fff',
  website: 'https://twitter.com/GoldAdventure',
};

//17
const AWHouse = {
  legacy: false,
  topLayer: [URL + '/img/logo/AWHouse.png'],
  name: 'AW House',
  desc: 'AW House is an Ecosystem for Autonomous World builders.',
  color: '#fff',
  bottomLayer: [],
  website: 'https://twitter.com/AW_house',
};

//18
const OrdenGG = {
  legacy: false,
  topLayer: [URL + '/img/logo/OrdenGG.png'],
  name: 'ordengg',
  desc: 'We are the orden, a professional on-chain esport team | We won 3/4 of the last dark forest rounds.',

  color: '#fff201',
  bottomLayer: [],
  website: 'https://twitter.com/orden_gg',
};

//19
const DFDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/DFDAO.png'],
  name: 'DFDAO',
  desc: 'DFDAO is a collective of Dark Forest players. To play Dark Forest is to build Dark Forest.',

  color: '#03ce95',
  bottomLayer: [],
  website: 'https://twitter.com/d_fdao',
};

//20
const FunBlocks = {
  legacy: false,
  topLayer: [URL + '/img/logo/FunBlocks.png'],
  bottomLayer: [],
  name: 'FunBlocks',
  desc: 'FunBlocks is a media which covers the most recent trends and innovations in fully on-chain games.\
  We believe that the ultimate goal of blockchain gaming is to bring joy and fun to players!',

  color: '#d8f2ff',
  website: 'https://twitter.com/0xFunBlocks',
};

//21
const WASD = {
  legacy: false,
  topLayer: [URL + '/img/logo/WASD.png'],
  name: 'WASD',
  desc: 'WASD is your home for onchain gaming content, community, and competition. \
  We have a newsletter where we share research and alpha on cool games and infra, \
  host esports leagues and tournaments,\
   and compete in several onchain games through WASD Guild, our gaming clan.',
  color: '#fff',
  bottomLayer: [],
  website: 'https://twitter.com/WASD_0x',
};

//22
const FunCraft = {
  legacy: false,
  topLayer: [URL + '/img/logo/FunCraft.png'],
  bottomLayer: [],
  name: 'Funcraft Guild',
  desc: 'play for fun, fun to craft.',
  color: 'f3b43b',
  website: 'https://twitter.com/Funcraftguild',
};

//23
const WorldExplorers = {
  legacy: false,
  topLayer: [URL + '/img/logo/WorldExplorers.png'],
  name: 'World Explorers',
  desc: "Player community and guild focused on exploring fully onchain games and Autonomous Worlds. We're currently the reigning world champions for SkyStrife. ",
  color: '#fff',
  bottomLayer: [],
  website: 'https://twitter.com/awexplorers',
};

//24
const AWResearch = {
  legacy: false,
  topLayer: [URL + '/img/logo/AWResearch.png'],
  name: 'AW Research',
  desc: 'AW Research is a research team focused on studying the Autonomous World. \
  We are committed to track the latest news in the Autonomous World,\
   exploring the journey from fully on chain games to the Autonomous World, and providing strategies for on chain games.',

  color: '#0a9053',
  bottomLayer: [],
  website: '',
};

//25
const ComposableLabs = {
  legacy: false,
  topLayer: [URL + '/img/logo/ComposableLabs.png'],
  name: 'ComposableLabs',
  desc: 'Composable Labs pushes the boundaries of composable realities, \
  providing tools and services that empower both creatives and gamers 💪',
  color: '#fff',
  bottomLayer: [],
  website: '',
};

//26
const MetaCat = {
  legacy: false,
  topLayer: [URL + '/img/logo/MetaCat.png'],
  name: 'MetaCat',
  desc: 'AW Adventurer & Metaverse Data Analytics & Content Navigation.',
  color: '#f7931a',
  bottomLayer: [],
  website: '',
};

export const logoFromType = (type: LogoType): Logo => logos[type];

export const logos: Record<LogoType, Logo> = {
  [LogoType.DarkForest]: DF,
  [LogoType.Lattice]: Lattice,
  [LogoType.Redstone]: Redstone,
  [LogoType.Mud]: Mud,
  [LogoType.Biomes]: Biomes,
  [LogoType.ThisCursedMachine]: ThisCursedMachine,
  [LogoType.SkyStrife]: SkyStrife,
  [LogoType.SmallBrainGames]: SmallBrainGames,
  [LogoType.DownStream]: DownStream,
  [LogoType.Dear]: Dear,
  [LogoType.DFARES]: DFARES,
  [LogoType.PixeLAW]: PixeLAW,
  [LogoType.GGQuest]: GGQuest,
  [LogoType.DFArchon]: DFArchon,
  [LogoType.Mask]: Mask,
  [LogoType.AGLDDAO]: AGLDDAO,
  [LogoType.AWHouse]: AWHouse,
  [LogoType.OrdenGG]: OrdenGG,
  [LogoType.DFDAO]: DFDAO,
  [LogoType.FunBlocks]: FunBlocks,
  [LogoType.WASD]: WASD,
  [LogoType.FunCraft]: FunCraft,
  [LogoType.WorldExplorers]: WorldExplorers,
  [LogoType.AWResearch]: AWResearch,
  [LogoType.ComposableLabs]: ComposableLabs,
  [LogoType.MetaCat]: MetaCat,
};

// export const avatarFromArtifactIdAndImageType = (
//   id: ArtifactId,
//   imageType: number,
//   ifRandom: boolean
// ): LogoType => {
//   const avatars = [
//     LogoType.DFARES,
//     LogoType.Doge,
//     LogoType.Cat,
//     LogoType.ChunZhen,
//     LogoType.IKunBird,
//     LogoType.Mike,
//     LogoType.Panda,
//     LogoType.Pepe,
//     LogoType.PigMan,
//     LogoType.RobotCat,
//     LogoType.TaiKuLa,
//     LogoType.Wojak1,
//     LogoType.Wojak2,
//     LogoType.Wojak3,
//     LogoType.Wojak4,
//     LogoType.DF,
//     LogoType.DFARES,
//     LogoType.DFArchon,
//     LogoType.AltLayer,
//     LogoType.DeGame,
//     LogoType.FunBlocks,
//     LogoType.GamePhylum,
//     LogoType.MarrowDAO,
//     LogoType.OrdenGG,
//     LogoType.DFDAO,
//     LogoType.Two77DAO,
//     LogoType.Web3MQ,
//     LogoType.Mask,
//     LogoType.AGLDDAO,
//     LogoType.Zero1a1,
//     LogoType.WeirdaoGhostGang,
//     LogoType.Briq,
//     LogoType.BlockBeats,
//     LogoType.Cointime,
//     LogoType.ChainCatcher,
//     LogoType.ForesightNews,
//     LogoType.SeeDAO,
//     LogoType.AWHouse,
//     LogoType.PaladinsDAO,
//     LogoType.NetherScape,
//     LogoType.UpchainDAO,
//     LogoType.LXDAO,
//     LogoType.MatrixWorld,
//     LogoType.CryptoChasers,
//     LogoType.AWResearch,
//     LogoType.BlockPi,
//     LogoType.WhaleDAO,
//     LogoType.Gametaverse,
//     LogoType.BuidlerDAO,
//     LogoType.THUBA,
//     LogoType.NJUBA,
//     LogoType.RUChain,
//     LogoType.SIEA,
//   ];
//   if (ifRandom) return avatars[parseInt(id.substring(id.length - 2), 16) % avatars.length];
//   else return avatars[parseInt(imageType.toString()) % avatars.length];
// };
