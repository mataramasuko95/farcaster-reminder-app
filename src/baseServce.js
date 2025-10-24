// Base (ETH) interaction service (prototype)
// prepareAndBroadcastTx(payload): prepare a transaction, leave signing in comments, and return mock tx hash.
// usdToEth(usdAmount): example conversion via CoinGecko (axios), but safe-fallback to a mock rate if API not available.

const axios = require("axios");
// const { ethers } = require('ethers'); // Only needed for real broadcast examples

async function usdToEth(usdAmount) {
  const amount = Number(usdAmount);
  if (!isFinite(amount) || amount <= 0) return 0;

  // Example real request to CoinGecko Simple Price API (no auth required, but rate-limited):
  // const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
  // const { data } = await axios.get(url, { timeout: 5000 });
  // const ethUsd = data?.ethereum?.usd;
  // if (!ethUsd) throw new Error('Failed to fetch ETH price');
  // return amount / ethUsd;

  // Prototype: fall back to a mock price (e.g., 1 ETH = $3000)
  const mockEthUsd = 3000;
  return amount / mockEthUsd;
}

async function prepareAndBroadcastTx(payload) {
  // Payload could include: { to, valueEth, data, alertId, fid, note }
  const { to = process.env.PAYMENT_ADDRESS || '0x000000000000000000000000000000000000dEaD', valueEth = 0, data = '0x', alertId } = payload || {};

  // Example (commented) real broadcast using ethers v6:
  // const rpcUrl = process.env.BASE_RPC_URL; // e.g., Alchemy/Infura/Base RPC URL
  // const provider = new ethers.JsonRpcProvider(rpcUrl);
  // const privateKey = process.env.PRIVATE_KEY; // NEVER hardcode; load via .env
  // const wallet = new ethers.Wallet(privateKey, provider);
  // const txRequest = {
  //   to,
  //   value: ethers.parseEther(String(valueEth)),
  //   data,
  // };
  // const txResponse = await wallet.sendTransaction(txRequest);
  // const receipt = await txResponse.wait();
  // return { hash: receipt.transactionHash, network: 'base', broadcasted: true };

  // Prototype: mock hash and no network call
  const mockHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0');
  const result = { hash: mockHash, network: 'base', broadcasted: false, alertId };
  console.log('[BaseMock] prepareAndBroadcastTx ->', result);
  return result;
}

module.exports = { usdToEth, prepareAndBroadcastTx };
