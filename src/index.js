// Express API for alerts prototype (Farcaster + Base reminder app)
// Security/integration notes:
// - Keep PRIVATE_KEY, BASE_RPC_URL, NEYNAR_API_KEY, PAYMENT_ADDRESS in a .env file (see .env.example).
// - Real tx sending with ethers should require explicit user confirmation before executing.

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { upsertAlert, getAlert } = require('./db');
const { usdToEth } = require('./baseServce');
const { prepareUnsignedPayment } = require('./payServce');
const { startScheduler } = require('./scheduler');

const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

function makeId() {
  return crypto.randomBytes(8).toString('hex');
}

function isValidISODateTime(s) {
  const t = Date.parse(s);
  return isFinite(t);
}

// POST /alerts
// body: { fid, datetimeISO, note, payUsd }
app.post('/alerts', async (req, res) => {
  try {
    const { fid, datetimeISO, note, payUsd } = req.body || {};
    if (!fid || typeof fid !== 'number') {
      return res.status(400).json({ ok: false, error: 'fid (number) required' });
    }
    if (!datetimeISO || !isValidISODateTime(datetimeISO)) {
      return res.status(400).json({ ok: false, error: 'datetimeISO (valid ISO string) required' });
    }

    const id = makeId();
    let payAmountEth = null;
    if (typeof payUsd === 'number' && payUsd > 0) {
      try {
        payAmountEth = await usdToEth(payUsd);
      } catch (e) {
        // fallback to null if pricing fails
        payAmountEth = null;
      }
    }

    const now = new Date().toISOString();
    const alert = {
      id,
      fid,
      datetimeISO,
      note: note || '',
      paid: false,
      txHash: null,
      payUsd: typeof payUsd === 'number' ? payUsd : null,
      payAmountEth,
      createdAt: now,
      updatedAt: now,
    };

    upsertAlert(alert);

    const mockInstruction = payAmountEth
      ? `Send ${payAmountEth} ETH to contract ${process.env.PAYMENT_ADDRESS || '0x0000...'} or call /pay/${id}`
      : 'No payment required in prototype; tx will be mocked by scheduler.';

    return res.status(201).json({ ok: true, id, payAmountEth, instruction: mockInstruction });
  } catch (err) {
    console.error('POST /alerts error', err?.message);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

// POST /pay
// body: { fd:number, ethAddress:string, usdAmount:number }
// Uses pay service to compute ethNeeded and build unsignedTx JSON (no broadcast)
app.post('/pay', async (req, res) => {
  try {
    const { fd, ethAddress, usdAmount } = req.body || {};

    if (typeof fd !== 'number' || !isFinite(fd)) {
      return res.status(400).json({ ok: false, error: 'fd (number) required' });
    }
    if (!ethAddress || typeof ethAddress !== 'string') {
      return res.status(400).json({ ok: false, error: 'ethAddress (string) required' });
    }
    const usd = Number(usdAmount);
    if (!isFinite(usd) || usd <= 0) {
      return res.status(400).json({ ok: false, error: 'usdAmount (number > 0) required' });
    }

    const result = await prepareUnsignedPayment({ fd, ethAddress, usdAmount: usd });
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('POST /pay error', err?.message);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

// GET /alerts/:id
app.get('/alerts/:id', (req, res) => {
  const { id } = req.params;
  const alert = getAlert(id);
  if (!alert) return res.status(404).json({ ok: false, error: 'not_found' });
  return res.json({ ok: true, alert });
});

// GET /casts/:fid (mock)
app.get('/casts/:fid', (req, res) => {
  const { fid } = req.params;
  const casts = [
    { id: 'cast1', fid: Number(fid), text: 'Hello Farcaster 👋', createdAt: new Date().toISOString() },
    { id: 'cast2', fid: Number(fid), text: 'This is a mock cast.', createdAt: new Date().toISOString() },
  ];
  return res.json({ ok: true, casts });
});

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'alerts-prototype', endpoints: ['/alerts', '/alerts/:id', '/casts/:fid', '/pay'] });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

// Start the simple scheduler after server boots
startScheduler();
