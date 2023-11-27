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

const DFARES = {
  legacy: false,
  topLayer: [URL + '/img/logo/DFARES.png'],
  bottomLayer: [],
  name: 'DF ARES',
  desc: 'DF ARES are Dark Forest\
   Community Rounds with Novel Game Mechanics hosted by DF Archon.',
  color: '#feae34',
};

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
  color: '#fee763',
};

const AltLayer = {
  legacy: false,
  topLayer: [URL + '/img/logo/AltLayer.png'],
  bottomLayer: [],
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

const AGLDDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/AGLDDAO.png'],
  bottomLayer: [],
  desc: 'AGLD DAO is committed to building Autonomous Worlds that embody the principles of decentralization, \
  transparency, fairness, and most importantly community sovereignty. The Loot Chain is designed to be a home for\
   builders in the Lootverse. It will become the go-to place for building new games, tools, and worlds within the Lootverse.',

  color: '#fff',
};

const Mask = {
  legacy: false,
  topLayer: [URL + '/img/logo/Mask.svg'],
  bottomLayer: [],
  name: 'Mask Network',
  desc: 'Mask Network brings privacy and benefits from Web3 to social media like Facebook & Twitter - with an open-sourced browser extension.',

  color: '#1FB3FB',
};

const Web3MQ = {
  legacy: false,
  topLayer: [URL + '/img/logo/Web3MQ.png'],
  bottomLayer: [],
  desc: 'Message relay network for Web3 based on current test results,\
  offering a trustless and seamless interactive experience. \
  With its interoperability, permissionless composability, and other features,\
   Web3MQ lowers integration barriers and provides developers with\
    convenient customization options. Web3MQ offers solutions for games, \
    social applications, and wallets, making it the next-generation provider\
     for fully on-chain gaming communication. ',

  color: '#9A26F9',
};

const DeGame = {
  legacy: false,
  topLayer: [URL + '/img/logo/DeGame.png'],
  bottomLayer: [],
  desc: 'DeGame is a leading Web3 gaming aggregator and community engagement platform, \
  listing over 4000 projects. Our aim is to establish a Proof of Contribution platform for Games, NFTs, and Metaverse initiatives.\
   We strive to guide users towards top projects through community engagement and ranking data. \
   Additionally, we serve as long-term ecosystem partners for NFT game development across various Layer1 and Layer2 projects, \
   actively recruiting developers for our partner network.',

  color: '#17d3f8',
};

const FunBlocks = {
  legacy: false,
  topLayer: [URL + '/img/logo/FunBlocks.png'],
  bottomLayer: [],
  desc: 'FunBlocks is a media which covers the most recent trends and innovations in fully on-chain games.\
  We believe that the ultimate goal of blockchain gaming is to bring joy and fun to players!',

  color: '#d8f2ff',
};

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

const MarrowDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/MarrowDAO.png'],
  desc: 'Guild W is the first on-chain e-sports team, incubated by MarrowDAO.\
  The main members are Solidity developers, node operators,\
  blockchain game players and investment analysts. All of them are loyal players of the Dark Forest.\
 Guild W believes in the future of native blockchain games and in the power of technology.\
 We are building a professional e-sports team with both software developers and game players.',
  color: '#fff',
  bottomLayer: [],
};

const OrdenGG = {
  legacy: false,
  topLayer: [URL + '/img/logo/OrdenGG.png'],
  desc: 'We are the orden, a professional on-chain esport team | We won 3/4 of the last dark forest rounds.',

  color: '#fff201',
  bottomLayer: [],
};

const DFDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/DFDAO.png'],
  desc: 'DFDAO is a collective of Dark Forest players. To play Dark Forest is to build Dark Forest.',

  color: '#03ce95',
  bottomLayer: [],
};

const Two77DAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/277DAO.png'],
  desc: 'We, 277 DAO, are a Chinese community that provides technical support, strategy sharing and NFT rewards for blockchain game players.\
  In order to make players enjoy blockchain game better, we will often organize community rounds with great rewards for you to win.\
  We look forward to your joining us!',

  color: '#c3c8d0',
  bottomLayer: [],
};

const Zero1a1 = {
  legacy: false,
  topLayer: [URL + '/img/logo/01a1.png'],
  desc: "At 01a1, we're a dedicated metaverse studio,\
  navigating new domains of digital art with an innovative spirit. \
  As an honored metaverse agency for The Sandbox, we've launched games like the 'Maya Water Park'\
  and created immersive experiences such as the 'Chongqing Underground City', inspired by Liu Cixin's novel 'The Wandering Earth'.",

  color: '#6389f1',
  bottomLayer: [],
};

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

  color: '#fff',
  bottomLayer: [],
};

const Briq = {
  legacy: false,
  topLayer: [URL + '/img/logo/Briq.png'],
  desc: 'Collect, build and play with briqs, the building blocks of the metaverse.',

  color: '#f35601',
  bottomLayer: [],
};

const SeeDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/SeeDAO.png'],
  desc: 'SeeDAO is a blockchain-based digital city-state, \
  which manifests itself as a decentralized digital network (SeeDAO Network) \
  and physical strong holds Seeshore manned around the world, built governed and shared by SeeDAO members.\
  It aims to help the birth of quality Web3 projects from education, information, and activities',

  color: '#fff',
  bottomLayer: [],
};

const NetherScape = {
  legacy: false,
  topLayer: [URL + '/img/logo/NetherScape.png'],
  desc: 'on-chain game using MUD engine to build a permissionless, composable, and autonomous RPG world.',

  color: '#fff',
  bottomLayer: [],
};

const TownStoryGalaxy = {
  legacy: false,
  topLayer: [URL + '/img/logo/TownStoryGALAXY.jpg'],
  desc: 'TownStory Galaxy is a free-to-play Web3 social simulation game built on Arbitrum Nova.\
  We have also incorporated AI elements into the game, such as finding hidden AI \
  in the game by imitating user behavior and participating in player interaction.',
  color: '#ff8e25',
  bottomLayer: [],
};

const AWHouse = {
  legacy: false,
  topLayer: [URL + '/img/logo/AWHouse.png'],
  desc: 'AW house is an Ecosystem for Autonomous World builders.',

  color: '#fff',
  bottomLayer: [],
};

const BlockBeats = {
  legacy: false,
  topLayer: [URL + '/img/logo/BlockBeats.png'],
  desc: 'News and one of the sharpest Chinese observers on Crypto, Web3.0 industry.',

  color: '#457cee',
  bottomLayer: [],
};

const Cointime = {
  legacy: false,
  topLayer: [URL + '/img/logo/Cointime.png'],
  desc: 'Crypto News, We Are Fast!',

  color: '#36ab10',
  bottomLayer: [],
};

const ChainCatcher = {
  legacy: false,
  topLayer: [URL + '/img/logo/ChainCatcher.png'],
  desc: 'ChainCatcher is a leading Web3 Chinese media founded in January 2018, \
  with over 1 million+ users and 1 billion+ reads. \
  ChainCatcher has accumulated profound industry resources after five years\
   in this field and has reached cooperation with industry leaders such as Flow, Binance, Mina, and Filecoin.',

  color: '#e9edfc',
  bottomLayer: [],
};

const ForesightNews = {
  legacy: false,
  topLayer: [URL + '/img/logo/ForesightNews.png'],
  desc: 'Foresight News is the largest multilingual Web3 media platform in the Asia-Pacific region. \
  Since its establishment in January 2022, it has rapidly grown into one of the most influential Web3 integrated platform for media.',

  color: '#4b65bf',
  bottomLayer: [],
};

const DAppChaser = {
  legacy: false,
  topLayer: [URL + '/img/logo/DAppChaser.png'],
  desc: 'DAppChaser is a distributed organization founded in 2018, focusing on blockchain-based innovations and DApp developments.',

  color: '#85ddda',
  bottomLayer: [],
};

const MatrixWorld = {
  legacy: false,
  topLayer: [URL + '/img/logo/MatrixWorld.png'],
  desc: "Matrix World is an open world that enables users to build 3D immersive applications on top of several blockchains. \
  In Matrix World, users can take advantage of traditional 3D open-world features such \
  as building 3D architectures, hosting virtual meetings, exhibiting NFTs, \
  and more advanced functionality such as creating their own 3D decentralized applications (dApps) using Matrix's built-in computational resources.",

  color: '#fff',
  bottomLayer: [],
};

const PaladinsDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/PaladinsDAO.png'],
  desc: 'Paladins is 100 governing members of a \
  gaming investments dao with the objective of developing and supporting gaming native IPs with an innovative crowdfunding model.',

  color: '#fff',
  bottomLayer: [],
};

const UpchainDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/UpchainDAO.svg'],
  desc: 'UpchainDAO is the homeland for blockchain technology enthusiasts to help developers enter the web3.',

  color: '#0767C8',
  bottomLayer: [],
};

const LXDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/LXDAO.png'],
  desc: 'LXDAO is an R&D-focused DAO in Web3. Focus on supporting valuable Web3 \
  Public Goods and Open Source sustainably. As of now, LXDAO has supported 12+ projects, \
  reaching out to a community of 2000+ members and having 65+ registered members.',

  color: '#36AFF9',
  bottomLayer: [],
};

const CryptoChasers = {
  legacy: false,
  topLayer: [URL + '/img/logo/CryptoChasers.png'],
  desc: 'The CryptoChasers community was established in December 2020, \
  created by Script Money. The community mainly consists of experienced \
  Crypto players and technically proficient developers. In October 2021,\
   it issued robot NFT, established the Robot DAO, and defined the mission, values, and goals of the DAO.',

  color: '#f7931a',
  bottomLayer: [],
};

const AWResearch = {
  legacy: false,
  topLayer: [URL + '/img/logo/AWResearch.png'],
  desc: 'AW Research is a research team focused on studying the Autonomous World. \
  We are committed to track the latest news in the Autonomous World,\
   exploring the journey from fully on chain games to the Autonomous World, and providing strategies for on chain games.',

  color: '#0a9053',
  bottomLayer: [],
};

const BlockPi = {
  legacy: false,
  topLayer: [URL + '/img/logo/BlockPi.png'],
  desc: 'BlockPI is a multi-chain globally distributed RPC Network, \
  offering topnotch RPC services with low cost, high performance, \
  low latency for all web3 projects. Also, BlockPI is paving its way on building a \
  unified platform with a suite of tools designed for Account Abstraction infrastructures.',
  color: '#22DEBB',
  bottomLayer: [],
};

const WhalerDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/WhalerDAO.png'],
  desc: 'WhalerDAO based on the pure Crypto concept, \
  aims to create a decentralized autonomous organization (DAO) that combines education and promotion, \
  investment and research. Within a diverse and thriving community ecosystem, \
  it forms a self-governing commercial loop for open governance, media distribution, and product development.',

  color: '#fff',
  bottomLayer: [],
};

const Gametaverse = {
  legacy: false,
  topLayer: [URL + '/img/logo/Gametaverse.png'],
  desc: 'Gametaverse strives to be the go-to aggregator for fully on-chain(FOC) and Web3 games, \
  offering users a user-friendly, real-time dashboard that consolidates\
   all blockchain game data and monitors the entire FOC game infrastructure.',

  color: '#31a8ff',
  bottomLayer: [],
};

const BuidlerDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/BuidlerDAO.png'],
  desc: '"Move over hodl, it\'s time to buidl!" \
    Buidler DAO gathers Web3 doers in research, technology, operations and other fields, \
    establishes a Web3 talent network and project accelerator; builds SocialDAO governance paradigm and DAO tools solution with its own practice.',

  color: '#00f38a',
  bottomLayer: [],
};

const THUBA = {
  legacy: false,
  topLayer: [URL + '/img/logo/THUBA.png'],
  desc: 'Tsinghua University Student Blockchain Association, our mission is to cultivate the next generation of Web3 leaders.',

  color: '#743581',
  bottomLayer: [],
};

const NJUBA = {
  legacy: false,
  topLayer: [URL + '/img/logo/NJUBA.png'],
  desc: 'NJU Blockchain Association was established in September 2018 by \
  about 100 students who love blockchain and formed with the support of\
   NJU Blockchain Lab. NJU BA aims to gather blockchain technology talents and enthusiasts,\
   spread correct blockchain values, provide a platform for students to learn and exchange blockchain technology.',

  color: ' #c868b3',
  bottomLayer: [],
};

const RUChain = {
  legacy: false,
  topLayer: [URL + '/img/logo/RUChain.png'],
  desc: 'RUChain is a student club formed spontaneously \
    by students of Renmin University of China. Its goal is to nurture\
     top talent in blockchain, explore the infinite possibilities of blockchain, \
     and lead the development of the blockchain industry.',

  color: '#efe8e8',
  bottomLayer: [],
};

const SIEA = {
  legacy: false,
  topLayer: [URL + '/img/logo/SIEA.png'],
  desc: 'SIEA is an organization under the guidance of Sdu Alumni\
  Office and supported by Sdu Alumni Youth CEO Club. It has gathered\
   multiple resources, aiming to help more innovation and entrepreneurship teams at Shandong University.',

  color: '#cd5c5c',
  bottomLayer: [],
};

const PTADAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/PTADAO.svg'],
  desc: 'PTADAO aims to be a gathering place for the most dynamic and talented AI \
  and Web3 professionals from around the world, and to develop Web3 and\
   AI products based on a radical market concept. Here is where developers can grow and\
    collaborate with like-minded partners to quickly launch new products.',

  color: '#cd5c5c',
  bottomLayer: [],
};

const ZJUBCA = {
  legacy: false,
  topLayer: [URL + '/img/logo/ZJUBCA.png'],
  desc: 'Providing an excellent platform for student interaction \
  and learning about blockchain. serving as one of the core support teams for the Zhejiang University-affiliated Z DAO, \
  the association strives to bridge the gap between research institutions and blockchain enthusiasts.',

  color: '#9d9895',
  bottomLayer: [],
};

const Cellula = {
  legacy: false,
  topLayer: [URL + '/img/logo/Cellula.png'],
  desc: "Cellula is a fully on-chain artificial life simulation game.\
  Players explore, cultivate, evolve, and collect unique Life forms in the game.\
 In this game, the rules of Conway's Game of Life are considered the genetic\
  code of the Life forms, determining their forms and vitality.\
   Using the game's crafting table, players can freely create a variety of genetic sequences \
   and give birth to their own on-chain Life forms. These Life forms have unique appearances and properties, and exhibit diverse life forms.",

  color: '#03feda',
  bottomLayer: [],
};

const WTFAcademy = {
  legacy: false,
  topLayer: [URL + '/img/logo/WTFAcademy.png'],
  desc: 'Web3 Open University for Web2 devs. Learn, test, and get certified at WTF Academy. Backed by  @Ethereum',

  color: '#f97407',
  bottomLayer: [],
};

const DappLearning = {
  legacy: false,
  topLayer: [URL + '/img/logo/DappLearning.png'],
  desc: 'An  online open-sourced developer community focusing on Ethereum.\
  We are designed for developers to step into blockchain DAPP development,\
   where they can learn DeFi, NFT, DAO, CRYPTO projects. We hope we could not \
   only give junior developers a feasible and easy-to-use blockchain DAPP learning roadmap,\
    but also present advanced developers with a platform for communication and cooperation.',

  color: ' #a5fbf7',
  bottomLayer: [],
};

const FFGDAO = {
  legacy: false,
  topLayer: [URL + '/img/logo/FFGDAO.png'],
  desc: 'Platform for onchain cryptoeconomic games',

  color: ' #03fa7d',
  bottomLayer: [],
};

const Rooch = {
  legacy: false,
  topLayer: [URL + '/img/logo/Rooch.png'],
  desc: 'Rooch is a Fast, Modular, Secured, Developer-Friendly infrastructure solution for building Web3 Native applications.',

  color: '#fff',
  bottomLayer: [],
};

const ggQuest = {
  legacy: false,
  topLayer: [URL + '/img/logo/ggQuest.png'],
  desc: 'ggQuest is a gaming reputation protocol which can be used for gamers to maintain a \
    comprehensive record of their gaming history across multiple games and chains.',
  color: '#fff',
  bottomLayer: [],
};

const CryptoChasersRobot = {
  legacy: false,
  topLayer: [URL + '/img/logo/CryptoChasersRobot.png'],
  bottomLayer: [],
  desc: 'CryptoChasers Robot is the first NFT of the CryptoChasers community. \
    The community is primarily composed of experienced crypto enthusiasts and skilled scientists.\
     By joining the community, members gain access to the latest event information,\
      money-making experiences sharing, and practical technical guidance. ',
  color: '#0A92AA',
};

export const logoFromType = (type: LogoType): Logo => logos[type];

export const logos: Record<LogoType, Logo> = {
  [LogoType.DF]: DF,
  [LogoType.DFARES]: DFARES,
  [LogoType.DFArchon]: DFArchon,
  [LogoType.AltLayer]: AltLayer,
  [LogoType.AGLDDAO]: AGLDDAO,
  [LogoType.Mask]: Mask,
  [LogoType.Web3MQ]: Web3MQ,
  [LogoType.DeGame]: DeGame,
  [LogoType.FunBlocks]: FunBlocks,
  [LogoType.GamePhylum]: GamePhylum,
  [LogoType.MarrowDAO]: MarrowDAO,
  [LogoType.OrdenGG]: OrdenGG,
  [LogoType.DFDAO]: DFDAO,
  [LogoType.Two77DAO]: Two77DAO,
  [LogoType.Zero1a1]: Zero1a1,
  [LogoType.WeirdaoGhostGang]: WeirdaoGhostGang,
  [LogoType.Briq]: Briq,
  [LogoType.SeeDAO]: SeeDAO,
  [LogoType.NetherScape]: NetherScape,
  [LogoType.TownStoryGalaxy]: TownStoryGalaxy,
  [LogoType.BlockBeats]: BlockBeats,
  [LogoType.Cointime]: Cointime,
  [LogoType.ChainCatcher]: ChainCatcher,
  [LogoType.ForesightNews]: ForesightNews,
  [LogoType.DAppChaser]: DAppChaser,
  [LogoType.MatrixWorld]: MatrixWorld,
  [LogoType.AWHouse]: AWHouse,
  [LogoType.PaladinsDAO]: PaladinsDAO,
  [LogoType.UpchainDAO]: UpchainDAO,
  [LogoType.LXDAO]: LXDAO,
  [LogoType.CryptoChasers]: CryptoChasers,
  [LogoType.AWResearch]: AWResearch,
  [LogoType.BlockPi]: BlockPi,
  [LogoType.WhalerDAO]: WhalerDAO,
  [LogoType.Gametaverse]: Gametaverse,
  [LogoType.BuidlerDAO]: BuidlerDAO,
  [LogoType.THUBA]: THUBA,
  [LogoType.NJUBA]: NJUBA,
  [LogoType.RUChain]: RUChain,
  [LogoType.SIEA]: SIEA,
  [LogoType.PTADAO]: PTADAO,
  [LogoType.ZJUBCA]: ZJUBCA,
  [LogoType.Cellula]: Cellula,
  [LogoType.WTFAcademy]: WTFAcademy,
  [LogoType.DappLearning]: DappLearning,
  [LogoType.FFGDAO]: FFGDAO,
  [LogoType.Rooch]: Rooch,
  [LogoType.ggQuest]: ggQuest,
  [LogoType.CryptoChasersRobot]: CryptoChasersRobot,
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
