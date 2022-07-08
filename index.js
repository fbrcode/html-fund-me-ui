// import local ethers extracted from: https://cdn.ethers.io/lib/ethers-5.6.esm.min.js
import { ethers } from './ethers-5.6.esm.min.js';
import { abi, contractAddress } from './constants.js';

// frontend actions where js type is "module"
const connectButton = document.getElementById('connectButton');
const fundButton = document.getElementById('fundButton');
const balanceButton = document.getElementById('balanceButton');
const withdrawButton = document.getElementById('withdrawButton');
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

// connect
async function connect() {
  if (typeof window.ethereum !== 'undefined') {
    // console.log("HAVE Metamask");
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    connectButton.innerHTML = 'Connected!';
  } else {
    // console.log("MISSING  Metamask");
    connectButton.innerHTML = 'Please, install Metamask !';
  }
}

// fund function
async function fund() {
  const ethAmount = document.getElementById('ethAmount').value;
  console.log(`Funding with ${ethAmount} ETH...`);
  if (typeof window.ethereum !== 'undefined') {
    // provider / connection to the blockchain
    // signer / wallet / someone with some gas
    // contract that we are interacting with (ABI + address )
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      // listen for transaction to be mined (wait for this TX to finish!)
      await listenForTransactionMine(transactionResponse, provider);
      console.log('Funding complete!');
      // listen for an event to be emitted
    } catch (error) {
      console.log(error);
    }
  }
}

// get balance function
async function getBalance() {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(`Balance: ${ethers.utils.formatEther(balance)}`);
  }
}

// mine transaction -> resolve the promise when we get a transaction receipt
function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  // listen for this transaction to finish
  // https://docs.ethers.io/v5/api/providers/provider/#Provider-once
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Transaction completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

// withdraw function
async function withdraw() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('Withdrawing...');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
}
