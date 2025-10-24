// Payment preparation service (prototype)
// - Converts USD to ETH using usdToEth (mock rate inside baseServce)
// - Builds an unsigned transaction JSON (no signing/broadcast)
// - Records a simple in-memory intent log

const { usdToEth } = require('./baseServce');

// In-memory store for payment intents
const payIntents = [];

async function prepareUnsignedPayment({ fd, ethAddress, usdAmount }) {
  const usd = Number(usdAmount);
  if (!isFinite(usd) || usd <= 0) {
    throw new Error('usdAmount_invalid');
  }
  if (typeof fd !== 'number' || !isFinite(fd)) {
    throw new Error('fd_invalid');
  }
  if (!ethAddress || typeof ethAddress !== 'string') {
    throw new Error('ethAddress_invalid');
  }

  const ethNeeded = await usdToEth(usd);
  const unsignedTx = {
    to: ethAddress,
    valueEth: ethNeeded,
    data: '0x',
  };

  payIntents.push({ fd, usdAmount: usd, ethNeeded, timestamp: new Date().toISOString() });
  return { fd, usdAmount: usd, ethNeeded, unsignedTx };
}

module.exports = { prepareUnsignedPayment };

