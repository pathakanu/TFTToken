import { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import faucetContract from "./ethereum/faucet";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState();
  const [fcContract, setfcContract] = useState();
  const [withdrawError, setwithdrawError] = useState("");
  const [withdrawSuccess, setwithdrawSuccess] = useState("");
  const [transactionData, setTranscationData] = useState("");
  const [balance, setBalance] = useState();

  useEffect(() => {
    getCurrentWalletConnected();
    addWalletListener();
  }, [walletAddress]);

  const connectWallet = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /* Get Provider */
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        /* get accounts */
        const accounts = await provider.send("eth_requestAccounts", []);
        /* get signer */
        setSigner(provider.getSigner());
        /* local contract instance */
        setfcContract(faucetContract(provider));

        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const getCurrentWalletConnected = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /* Get Provider */
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        /* get accounts */
        const accounts = await provider.send("eth_accounts", []);
        /* get signer */
        setSigner(provider.getSigner());
        /* local contract instance */
        setfcContract(faucetContract(provider));

        if (accounts.length > 0) {
          /* get signer */
          setSigner(provider.getSigner());
          /* local contract instance */
          setfcContract(faucetContract(provider));
          setWalletAddress(accounts[0]);
          console.log(accounts[0]);
        } else {
          console.log("Connect to MetaMask using the Connect button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const addWalletListener = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      });
    } else {
      /* MetaMask is not installed */
      setWalletAddress("");
      console.log("Please install MetaMask");
    }
  };

  function getData(val) {
    console.log(val.target.value);
    setWalletAddress(val.target.value);
  }

  const getTFTHandler = async () => {
    try {
      setwithdrawError("");
      setwithdrawSuccess("");
      const fcContractWithSigner = fcContract.connect(signer);
      const resp = await fcContractWithSigner.getFreeTokens(walletAddress);
      console.log(resp);
      setwithdrawSuccess("FREE TFT token have been sent! Enjoy :)");
      setTranscationData(resp.hash);

    } catch (err) {
      console.log(err.message);
      setwithdrawError(err.message);
    }
  }

  const getTFTToken = async () => {
    try {
      setwithdrawError("");
      setwithdrawSuccess("");
      const fcContractWithSigner = fcContract.connect(signer);
      const resp = (await fcContractWithSigner.balanceOf(walletAddress)).toString();
      console.log(resp);
      setBalance(resp);

    } catch (err) {
      console.log(err.message);
      setwithdrawError(err.message);
    }
  }

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <h1 className="navbar-item is-size-4">TFT Token (TFT)</h1>
          </div>
          <div id="navbarMenu" className="navbar-menu">
            <div className="navbar-end is-align-items-center">
              <button
                className="button is-white connect-wallet"
                onClick={connectWallet}
              >
                <span className="is-link has-text-weight-bold">
                  {walletAddress && walletAddress.length > 0
                    ? `Connected: ${walletAddress.substring(
                      0,
                      6
                    )}...${walletAddress.substring(38)}`
                    : "Connect Wallet"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <section className="hero is-fullheight">
        <div className="faucet-hero-body">
          <div className="container has-text-centered main-content">
            <h1 className="title is-1">Faucet</h1>
            <p>Fast and reliable. 5 TFT/day.</p>
            <div className="mt=5">
              {withdrawError && (
                <div className="withdraw-error">{withdrawError}</div>
              )}
              {withdrawSuccess && (
                <div className="withdraw-success">{withdrawSuccess}</div>
              )}
            </div>
            <div className="box address-box">
              <div className="columns">
                <div className="column is-four-fifths">
                  <input
                    className="input is-medium"
                    type="text"
                    placeholder="Enter your wallet address (0x...)"
                    defaultValue={walletAddress}
                    onChange={getData}
                  />
                </div>
                <div className="buttons">
                  <div className="column">
                    <button className="button is-link is-medium" onClick={getTFTHandler}>
                      GET TOKENS
                    </button>
                  </div>
                  <span className="mtr5">
                    {balance && (
                      <div className="balance">{balance}</div>
                    )}
                  </span>
                  <div className="column">
                    <button className="button is-link is-medium" onClick={getTFTToken}>
                      GET BALANCE
                    </button>
                  </div>
                </div>
              </div>
              <article className="panel is-grey-darker">
                <p className="panel-heading">Transaction Data</p>
                <div className="panel-block">
                  <p>
                    {transactionData ? `Transaction Hash: ${transactionData}` : "--"}
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
