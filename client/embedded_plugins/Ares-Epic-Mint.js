import { ethers } from 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js';
import { html, render, useEffect, useState } from 'https://esm.sh/htm/preact/standalone';

const URL = 'https://rpc.redstonechain.com';
const AresEpicAddress = '0x04aa4eca2a4cc7f9a911440a614392a52da98167';
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
const overrides = {
  gasPrice: 1000,
};

const wrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};
const rowStyle = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
};

function Heading({ title }) {
  return html`<h2
    style=${{
      fontSize: '14pt',
      textDecoration: 'underline',
    }}
  >
    ${title}
  </h2>`;
}

// Ares Epic

function App() {
  const [account, setAccount] = useState(null);

  const [mainAccount, setMainAccount] = useState(EMPTY_ADDRESS);

  const [mintedTokenId, setMintedTokenId] = useState('0');

  const [image, setImage] = useState('');

  useEffect(() => {
    const account = df.getAccount();
    setAccount(account);

    async function getInfo() {
      const burnerAccount = df.getAccount();
      const provider = new ethers.JsonRpcProvider(URL);
      const wallet = new ethers.Wallet(df.getPrivateKey());
      const signer = wallet.connect(provider);
      const AresEpic = new ethers.Contract(AresEpicAddress, AresEpicABI, signer);

      const _minted = await AresEpic.getMinted(burnerAccount);

      setMintedTokenId(_minted.toString());

      if (_minted.toString() !== '0') {
        const _main = await AresEpic.getBurnerToMain(burnerAccount);
        setMainAccount(_main.toLowerCase().toString());
        const tokenURI = await AresEpic.tokenURI(_minted);
        const content1 = atob(tokenURI.slice(29));
        const obj = JSON.parse(content1);
        setImage(obj.image);
      }
    }

    getInfo();
  }, []);

  function MintAresEpicPane() {
    if (mintedTokenId !== '0') return html``;

    const [inputMainAccount, setInputMainAccount] = useState('');
    const [inputPlayerName, setInputPlayerName] = useState('');
    const [buttonContent, setButtonContent] = useState('Mint Ares Epic');

    const onClick = async () => {
      if (inputMainAccount === '' || inputMainAccount === EMPTY_ADDRESS) {
        window.alert('main account invaild');
        return;
      }

      if (inputMainAccount === account) {
        window.alert("please don't use burner account as main account");
        return;
      }
      try {
        const burnerAccount = df.getAccount();
        const provider = new ethers.JsonRpcProvider(URL);
        const wallet = new ethers.Wallet(df.getPrivateKey());
        const signer = wallet.connect(provider);
        const AresEpic = new ethers.Contract(AresEpicAddress, AresEpicABI, signer);

        setButtonContent('waiting...');
        const tx = await AresEpic.mint(inputMainAccount, inputPlayerName, overrides);
        await tx.wait();
        setButtonContent('Mint Ares Epic NFT');

        const _minted = await AresEpic.getMinted(burnerAccount);
        console.log(_minted);

        if (_minted.toString() !== '0') {
          setMintedTokenId(_minted.toString());
          const _main = await AresEpic.getBurnerToMain(burnerAccount);
          setMainAccount(_main.toLowerCase().toString());
          const tokenURI = await AresEpic.tokenURI(_minted);
          const content1 = atob(tokenURI.slice(29));
          const obj = JSON.parse(content1);
          setImage(obj.image);
        }
      } catch (e) {
        console.error(e);
        window.alert('An error has occurred. Please contact the admin');

        setButtonContent('Mint Ares Epic');
      }
    };

    return html`<div>
      <${Heading} title="Mint Ares Epic" />
      <p>Input main account</p>
      <div style=${rowStyle}>
        <df-text-input
          style=${{ flex: 1, height: '20px', width: '300px' }}
          value=${inputMainAccount}
          onInput=${(e) => setInputMainAccount(e.target.value)}
          placeholder="Input main account here"
        ></df-text-input>
      </div>
      <div style=${{ height: '10px' }}></div>
      <div>Input player name</div>
      <div>If want to remain anonymous, you can leave this field blank</div>
      <div style=${rowStyle}>
        <df-text-input
          style=${{ flex: 1, height: '20px', width: '300px' }}
          value=${inputPlayerName}
          onInput=${(e) => setInputPlayerName(e.target.value)}
          placeholder="Input player name here"
        ></df-text-input>
      </div>
      <div style=${{ height: '10px' }}></div>

      <div style=${{ height: '15px' }}></div>
      <div style=${{ display: 'flex', justifyContent: 'center' }}>
        <button
          style=${{ width: '150px', color: 'pink' }}
          onClick=${onClick}
          disabled=${buttonContent === 'waiting...'}
        >
          ${buttonContent}
        </button>
      </div>
    </div>`;
  }

  return html`
      <div style=${wrapperStyle}>
      <div>
      <p style=${{ color: 'pink' }}> ARES EPIC IS THE TICKET TO ENTER NEW WORLD. </p>
      <p> contract: ${AresEpicAddress} </p>
    </div>
      <div></div>
      <div>
        <p>Burner account: ${account}</p>
        <p style=${{ color: 'pink' }}>PLEASE SUBMIT YOUR MAIN ACCOUNT TO GET BONUS. </p>
        <p>Main Account: ${mainAccount === EMPTY_ADDRESS ? 'Not set yet' : mainAccount}</p>
        <p>Ares Epic TokenId: ${mintedTokenId === '0' ? 'Not mint yet' : mintedTokenId}</p>
     </div>
    <${MintAresEpicPane} />
    <img src=${image}> </img>
      </div>
    `;
}

class Plugin {
  async render(container) {
    container.style.width = '500px';
    container.style.height = '680px';
    render(html`<${App} />`, container);
  }
}

export default Plugin;

//BEGIN OF ABI
export const AresEpicABI = [
  {
    "inputs": [
      {
        "internalType": "contract IDFAres",
        "name": "_DFAresContract",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "AddressInsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ERC721EnumerableForbiddenBatchMint",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC721IncorrectOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ERC721InsufficientApproval",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidOperator",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ERC721NonexistentToken",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "ERC721OutOfBoundsIndex",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FailedInnerCall",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_mainAccount",
        "type": "address"
      }
    ],
    "name": "adminChangeMainAccount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "playerName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "teamName",
        "type": "string"
      }
    ],
    "name": "adminChangeName",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "_burnerAccounts",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_roles",
        "type": "uint256[]"
      }
    ],
    "name": "batchAddRoles",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "tokenIds",
        "type": "uint256[]"
      }
    ],
    "name": "batchHardRefreshMetadata",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "ids",
        "type": "uint256[]"
      }
    ],
    "name": "bulkGetMetadata1",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "role",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "playerName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "teamName",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "homePlanetId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "mainAccount",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "burnerAccount",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "rank",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "score",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "silver",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "move",
            "type": "uint256"
          }
        ],
        "internalType": "struct AresEpic.Metadata1[]",
        "name": "ret",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "ids",
        "type": "uint256[]"
      }
    ],
    "name": "bulkGetMetadata2",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "findArtifactAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "activateArtifactAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "dropBombAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "pinkAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "pinkedAmount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "ifFirstMythicArtifactOwner",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "ifFirstBurnLocationOperator",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "ifFirstKardashevOperator",
            "type": "bool"
          }
        ],
        "internalType": "struct AresEpic.Metadata2[]",
        "name": "ret",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimFund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "freeze",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "frozen",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "burnerAccount",
        "type": "address"
      }
    ],
    "name": "getBurnerToMain",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getMetadata1",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "role",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "playerName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "teamName",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "homePlanetId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "mainAccount",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "burnerAccount",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "rank",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "score",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "silver",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "move",
            "type": "uint256"
          }
        ],
        "internalType": "struct AresEpic.Metadata1",
        "name": "ret",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getMetadata2",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "findArtifactAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "activateArtifactAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "dropBombAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "pinkAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "pinkedAmount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "ifFirstMythicArtifactOwner",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "ifFirstBurnLocationOperator",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "ifFirstKardashevOperator",
            "type": "bool"
          }
        ],
        "internalType": "struct AresEpic.Metadata2",
        "name": "ret",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "burnerAccount",
        "type": "address"
      }
    ],
    "name": "getMinted",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "hardRefreshMetadata",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "s",
        "type": "string"
      }
    ],
    "name": "len",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "metadataStorage1",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "role",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "playerName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "teamName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "homePlanetId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "mainAccount",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "burnerAccount",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "rank",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "score",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "silver",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "move",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "metadataStorage2",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "findArtifactAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "activateArtifactAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "dropBombAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "pinkAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "pinkedAmount",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "ifFirstMythicArtifactOwner",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "ifFirstBurnLocationOperator",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "ifFirstKardashevOperator",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "mainAccount",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "playerName",
        "type": "string"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "thaw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "tokenByIndex",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

//END OF ABI
