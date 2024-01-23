import { PICTURE_URL } from '@dfares/constants';
import { LogoType } from '@dfares/types';

export type Logo = {
  legacy: boolean;
  topLayer: Array<string>;
  bottomLayer: Array<string>;
  color: string;
  desc: string;
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
};

//4
const DFARES = {
  legacy: false,
  topLayer: [URL + '/img/logo/DFARES.png'],
  bottomLayer: [],
  name: 'Dark Forest ARES',
  desc: 'Dark Forest ARES are Dark Forest\
   Community Rounds with novel game mechanics hosted by DF Archon.',
  color: 'pink',
};

//5
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
};

//6
const AGLDDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/AGLDDAO.png'],
  bottomLayer: [],
  name: 'AGLD DAO',
  desc: 'AGLD DAO is committed to building Autonomous Worlds that embody the principles of decentralization, \
  transparency, fairness, and most importantly community sovereignty. The Loot Chain is designed to be a home for\
   builders in the Lootverse. It will become the go-to place for building new games, tools, and worlds within the Lootverse.',

  color: '#fff',
};

//7
const Mask = {
  legacy: false,
  topLayer: [URL + '/img/logo/Mask.svg'],
  bottomLayer: [],
  name: 'Mask Network',
  desc: 'Mask Network brings privacy and benefits from Web3 to social media like Facebook & Twitter - with an open-sourced browser extension.',
  color: '#1FB3FB',
};

//8
const Web3MQ = {
  legacy: false,
  topLayer: [URL + '/img/logo/Web3MQ.png'],
  bottomLayer: [],
  name: 'Web3MQ',
  desc: 'Message relay network for Web3 based on current test results,\
  offering a trustless and seamless interactive experience. \
  With its interoperability, permissionless composability, and other features,\
   Web3MQ lowers integration barriers and provides developers with\
    convenient customization options. Web3MQ offers solutions for games, \
    social applications, and wallets, making it the next-generation provider\
     for fully on-chain gaming communication. ',

  color: '#9A26F9',
};

//9
const AltLayer = {
  legacy: false,
  topLayer: [URL + '/img/logo/AltLayer.png'],
  bottomLayer: [],
  name: 'AltLayer',
  desc: 'Decentralized & Elastic Rollups-as-a-Service Protocol.\
  Backed by \
  @balajis\
  @polychaincap\
  @hjmomtazi\
  @jump_\
  @gavofyork\
  @kaiynne\
  @tekinsalimi\
  @twobitidiot',

  color: '#787ab4',
};

//10
const FunBlocks = {
  legacy: false,
  topLayer: [URL + '/img/logo/FunBlocks.png'],
  bottomLayer: [],
  name: 'FunBlocks',
  desc: 'FunBlocks is a media which covers the most recent trends and innovations in fully on-chain games.\
  We believe that the ultimate goal of blockchain gaming is to bring joy and fun to players!',

  color: '#d8f2ff',
};

//11
const GamePhylum = {
  legacy: false,
  topLayer: [URL + '/img/logo/GamePhylum.png'],
  bottomLayer: [],
  name: 'GamePhylum',
  desc: 'GamePhylum is a DAO-driven platform focused on game content creation and distribution,\
   with a vision to create an immersive Web3 game player community.',
  logo: '/images/logo/GamePhylum.png',
  color: '#06beca',
};

//12
const OrdenGG = {
  legacy: false,
  topLayer: [URL + '/img/logo/OrdenGG.png'],
  name: 'ordengg',
  desc: 'We are the orden, a professional on-chain esport team | We won 3/4 of the last dark forest rounds.',

  color: '#fff201',
  bottomLayer: [],
};

//13
const MarrowDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/MarrowDAO.png'],
  name: 'Guild W',
  desc: 'Guild W is the first on-chain e-sports team, incubated by MarrowDAO.\
  The main members are Solidity developers, node operators,\
  blockchain game players and investment analysts. All of them are loyal players of the Dark Forest.\
 Guild W believes in the future of native blockchain games and in the power of technology.\
 We are building a professional e-sports team with both software developers and game players.',
  color: '#fff',
  bottomLayer: [],
};

//14
const DFDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/DFDAO.png'],
  name: 'DFDAO',
  desc: 'DFDAO is a collective of Dark Forest players. To play Dark Forest is to build Dark Forest.',

  color: '#03ce95',
  bottomLayer: [],
};

//15
const Two77DAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/277DAO.png'],
  name: '277 DAO',
  desc: 'We, 277 DAO, are a Chinese community that provides technical support, strategy sharing and NFT rewards for blockchain game players.\
  In order to make players enjoy blockchain game better, we will often organize community rounds with great rewards for you to win.\
  We look forward to your joining us!',

  color: '#c3c8d0',
  bottomLayer: [],
};

//16
const WeirdaoGhostGang = {
  legacy: false,
  topLayer: [URL + '/img/logo/WeirdoGhostGang.png'],
  desc: 'Weirdo Ghost Gang, affectionately known as "Lil Ghost",\
  is a Web3 native IP incubated by ManesLAB. \
  Having a storied background in pioneering aesthetics,\
   a free-spirited community culture, and diverse development trajectories, \
   Weirdo Ghost Gang has captivated collectors, artists, and musicians worldwide.\
    Embodying Web3\'s free, open, innovative, \
    and inclusive lifestyle, Weirdo Ghost Gang amplifies creative content and operations to inspire. \
    Their unwavering essence is to "OUTA THE BOX, BE A WEIRDO."',
  name: 'Weirdao Ghost Gang',
  color: '#fff',
  bottomLayer: [],
};

//17
const OVERLORDS = {
  legacy: false,
  topLayer: [URL + '/img/logo/Overlords.png'],
  name: 'OVERLORDS',
  desc: 'Our overall mission is to be a central hub for on-chain games players to coordinate games with each other and to collect game winning resources and strategies.',
  color: '#fff',
  bottomLayer: [],
};

//18
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
};

19;
const WorldExplorers = {
  legacy: false,
  topLayer: [URL + '/img/logo/WorldExplorers.png'],
  name: 'World Explorers',
  desc: "Player community and guild focused on exploring fully onchain games and Autonomous Worlds. We're currently the reigning world champions for SkyStrife. ",
  color: '#fff',
  bottomLayer: [],
};

//20
const AWHouse = {
  legacy: false,
  topLayer: [URL + '/img/logo/AWHouse.png'],
  name: 'AW House',
  desc: 'AW House is an Ecosystem for Autonomous World builders.',
  color: '#fff',
  bottomLayer: [],
};

//21
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
};

//22
const ComposableLabs = {
  legacy: false,
  topLayer: [URL + '/img/logo/ComposableLabs.png'],
  name: 'ComposableLabs',
  desc: 'Composable Labs pushes the boundaries of composable realities, \
  providing tools and services that empower both creatives and gamers 💪',
  color: '#fff',
  bottomLayer: [],
};

//23
const AWResearch = {
  legacy: false,
  topLayer: [URL + '/img/logo/AWResearch.png'],
  name: 'AW Research',
  desc: 'AW Research is a research team focused on studying the Autonomous World. \
  We are committed to track the latest news in the Autonomous World,\
   exploring the journey from fully on chain games to the Autonomous World, and providing strategies for on chain games.',

  color: '#0a9053',
  bottomLayer: [],
};

//24
const LXDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/LXDAO.png'],
  name: ' LXDAO',
  desc: 'LXDAO is an R&D-focused DAO in Web3. Focus on supporting valuable Web3 \
  Public Goods and Open Source sustainably. As of now, LXDAO has supported 12+ projects, \
  reaching out to a community of 2000+ members and having 65+ registered members.',

  color: '#36AFF9',
  bottomLayer: [],
};

//25
const CryptoChasers = {
  legacy: false,
  topLayer: [URL + '/img/logo/CryptoChasers.png'],
  name: 'CryptoChasers',
  desc: 'The CryptoChasers community was established in December 2020, \
  created by Script Money. The community mainly consists of experienced \
  Crypto players and technically proficient developers. In October 2021,\
   it issued robot NFT, established the Robot DAO, and defined the mission, values, and goals of the DAO.',

  color: '#f7931a',
  bottomLayer: [],
};

//26
const MetaCat = {
  legacy: false,
  topLayer: [URL + '/img/logo/MetaCat.png'],
  name: 'MetaCat',
  desc: 'AW Adventurer & Metaverse Data Analytics & Content Navigation.',
  color: '#f7931a',
  bottomLayer: [],
};

//27
const BlockPI = {
  legacy: false,
  topLayer: [URL + '/img/logo/BlockPi.png'],
  name: 'BlockPI',
  desc: 'BlockPI is a multi-chain globally distributed RPC Network, \
  offering topnotch RPC services with low cost, high performance, \
  low latency for all web3 projects. Also, BlockPI is paving its way on building a \
  unified platform with a suite of tools designed for Account Abstraction infrastructures.',
  color: '#22DEBB',
  bottomLayer: [],
};

//28
const BlockBeats = {
  legacy: false,
  topLayer: [URL + '/img/logo/BlockBeats.png'],
  name: 'BlockBeats',
  desc: 'News and one of the sharpest Chinese observers on Crypto, Web3.0 industry.',
  color: '#457cee',
  bottomLayer: [],
};

//29
const ChainCatcher = {
  legacy: false,
  topLayer: [URL + '/img/logo/ChainCatcher.png'],
  name: 'ChainCatcher',
  desc: 'ChainCatcher is a leading Web3 Chinese media founded in January 2018, \
  with over 1 million+ users and 1 billion+ reads. \
  ChainCatcher has accumulated profound industry resources after five years\
   in this field and has reached cooperation with industry leaders such as Flow, Binance, Mina, and Filecoin.',
  color: '#e9edfc',
  bottomLayer: [],
};

//30
const NetherScape = {
  legacy: false,
  topLayer: [URL + '/img/logo/NetherScape.png'],
  desc: 'on-chain game using MUD engine to build a permissionless, composable, and autonomous RPG world.',
  color: '#fff',
  bottomLayer: [],
};

//31
const SeeDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/SeeDAO.png'],
  name: 'SeeDAO',
  desc: 'SeeDAO is a blockchain-based digital city-state, \
  which manifests itself as a decentralized digital network (SeeDAO Network) \
  and physical strong holds Seeshore manned around the world, built governed and shared by SeeDAO members.\
  It aims to help the birth of quality Web3 projects from education, information, and activities',

  color: '#fff',
  bottomLayer: [],
};

//32
const Gametaverse = {
  legacy: false,
  topLayer: [URL + '/img/logo/Gametaverse.png'],
  desc: 'Gametaverse strives to be the go-to aggregator for fully on-chain(FOC) and Web3 games, \
  offering users a user-friendly, real-time dashboard that consolidates\
   all blockchain game data and monitors the entire FOC game infrastructure.',

  color: '#31a8ff',
  bottomLayer: [],
};

//33
const GWGDAO = {
  legacy: false,
  name: 'GWGDAO',
  topLayer: [URL + '/img/logo/GWGDAO.png'],
  desc: 'Girls Who Game (GWG) Blockchain Gaming Community. Share new information and tutorials.',
  color: '#FFF',
  bottomLayer: [],
};

//34
const Web3Games = {
  legacy: false,
  topLayer: [URL + '/img/logo/Web3Games.png'],
  bottomLayer: [],
  name: 'Web3Games',
  desc: "🌐 Accelerate the world's transition to Fully On-Chain Gaming (FOCG) with http://Web3Games.com \
  Platform & W3Gamez Network. $W3G Public Sale starts from 23 January. 🔥",
  color: '#FFF',
};

export const logoFromType = (type: LogoType): Logo => logos[type];

export const logos: Record<LogoType, Logo> = {
  [LogoType.DF]: DF,
  [LogoType.Lattice]: Lattice,
  [LogoType.Redstone]: Redstone,
  [LogoType.DFARES]: DFARES,
  [LogoType.DFArchon]: DFArchon,
  [LogoType.AGLDDAO]: AGLDDAO,
  [LogoType.Mask]: Mask,
  [LogoType.Web3MQ]: Web3MQ,
  [LogoType.AltLayer]: AltLayer,
  [LogoType.FunBlocks]: FunBlocks,
  [LogoType.GamePhylum]: GamePhylum,
  [LogoType.OrdenGG]: OrdenGG,
  [LogoType.DFDAO]: DFDAO,
  [LogoType.MarrowDAO]: MarrowDAO,
  [LogoType.Two77DAO]: Two77DAO,
  [LogoType.WeirdaoGhostGang]: WeirdaoGhostGang,
  [LogoType.Overlords]: OVERLORDS,
  [LogoType.WASD]: WASD,
  [LogoType.WorldExplorers]: WorldExplorers,
  [LogoType.AWHouse]: AWHouse,
  [LogoType.GGQuest]: GGQuest,
  [LogoType.ComposableLabs]: ComposableLabs,
  [LogoType.AWResearch]: AWResearch,
  [LogoType.LXDAO]: LXDAO,
  [LogoType.CryptoChasers]: CryptoChasers,
  [LogoType.MetaCat]: MetaCat,
  [LogoType.BlockPi]: BlockPI,
  [LogoType.BlockBeats]: BlockBeats,
  [LogoType.ChainCatcher]: ChainCatcher,
  [LogoType.NetherScape]: NetherScape,
  [LogoType.SeeDAO]: SeeDAO,
  [LogoType.Gametaverse]: Gametaverse,
  [LogoType.GWGDAO]: GWGDAO,
  [LogoType.Web3Games]: Web3Games,
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
