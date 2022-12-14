import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-q2p4brem7n';
const TOTAL_MINT_COUNT = 50;

const App = () => {
  const CONTRACT_ADDRESS = "0xF1Ea0f00E6f9178246f1fB9D6A3C0697b435eE25";
  // state var to store user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);
  
  const checkIfWalletIsConnected = async () => {
    // make sure have access to window.ethereum
    const { ethereum } = window;

    if (ethereum) {
      console.log("We have the ethereum object", ethereum);
    }
    else {
      console.log("Make sure you have MetaMask!");
      return;
    }

    // check if authorized to access user's wallet
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    // users can have multiple authorized accounts, grab the 1st one
    if (accounts.length == 0) {
      console.log("No authorized account found");
    }
    else {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
      setupEventListener();
    }
      
  };

  const connectWallet = async () => {
    try {
      const goerliChainId = "0x5"; // hex code of Goerli network chain ID
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      if (chainId == goerliChainId) {
        // request access to account
        const accounts = await ethereum.request({ method: "eth_requestAccounts"});

        // print public addr once authorize MetaMask
        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]);
        setupEventListener();
      }
      else {
      	alert("You are not connected to the Goerli Test Network!");
      }
    }
    catch (error) {
      console.log(error);
      
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setLoading(true);

        console.log("Mining... please wait");
        await nftTxn.wait();

        console.log(`Mined, see transaction : https://goerli.etherscan.io/tx/${nftTxn.hash}`);
        setLoading(false);
      }
      else {
        console.log("Ethereum object does not exist!");
      }
    } 
    catch (error) {
      console.log(error);
    }
      
  };

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // listen for NewEpicNFTMinted event from smart contract
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(`Hey there! We've minted your NFT & sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
        });

        console.log("Setup event listener");
      }
      else {
        console.log("Ethereum object does not exist!");
      }
    }
    catch (error) {
      console.log(error);
    }
  };
  
  // Render Methods
  // in JS, => is considered as "return"  
  // here we use "()" to indicate we are returning HTML
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  // use "{}" if need to use some vars before return HTML
  const renderMintUI = () => {
    if (loading) { // loading animation when mining
      return (
        <button disabled className="cta-button connect-wallet-button">
          Loading...
        </button>
      )
    }
    else {
      return (
        <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
          Mint NFT
        </button>
      )
    }
  };
  
  // this runs during page load
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
        </div>
        <div className="footer-container">
          <a
            className="footer-text"
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
          >???? View Collection on OpenSea</a>
        </div>
      </div>
    </div>
  );
};

export default App;