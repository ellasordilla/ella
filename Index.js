import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionValue, setTransactionValue] = useState("");
  const [showBalance, setShowBalance] = useState(true); 
  const [showAccount, setShowAccount] = useState(true); 

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(balance.toBigInt());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(ethers.utils.parseEther(transactionValue));
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(ethers.utils.parseEther(transactionValue));
      await tx.wait();
      getBalance();
    }
  };

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  const toggleAccountVisibility = () => {
    setShowAccount(!showAccount);
  };

  const initUser = () => {
    
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }
  
    
    if (!account) {
      return <button onClick={connectAccount}>Click to Open</button>;
    }
  
    if (balance === undefined) {
      getBalance();
      return <p>Loading balance...</p>;
    }
  
    const balanceInEther = ethers.utils.formatEther(balance);

    return (
      <div>
        {showAccount && <p>Your Account: {account}</p>}
        {showBalance && <p>Your Balance: {balanceInEther} ETH</p>}
        <input
          type="text"
          value={transactionValue}
          onChange={(e) => setTransactionValue(e.target.value)}
          placeholder="Enter amount"
        />
        <button onClick={deposit}>Deposit</button>
        <button onClick={withdraw}>Withdraw</button>
        <button onClick={toggleBalanceVisibility}>{showBalance ? "Hide Balance" : "Show Balance"}</button>
        <button onClick={toggleAccountVisibility}>{showAccount ? "Hide Account" : "Show Account"}</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header> 
        <h1>Welcome to the Ellgraxias Wallet!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
