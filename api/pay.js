// api/pay.js
// Vercel serverless endpoint (CommonJS)
const centsPerUsd = 1; // not used but shows intent
// Fake exchange rate used for demo (1 ETH = 3000 USD). Put a real rate if you want.
const DEFAULT_USD_PER_ETH = 3000;

// Default payment address (your address). You can override with PAYMENT_ADDRESS env var.
const DEFAULT_PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS || "0xfA34687f5BdCF7DcBeBbF00e7A81c38188cf6772";

function usdToEth(usdAmount, usdPerEth = DEFAULT_USD_PER_ETH) {
  const eth = Number(usdAmount) / Number(usdPerEth);
  return eth;
}

module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Only POST allowed. Send JSON body." });
    return;
  }

  try {
    const { fid, usdAmount, ethAddress } = req.body || {};

    if (!fid || !usdAmount || !ethAddress) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields. Required: fid, usdAmount, ethAddress",
        exampleBody: {
          fid: 1234,
          usdAmount: 0.05,
          ethAddress: "0xABCDEF..."
        }
      });
    }

    // Calculate ETH needed (rounded to 8 decimal places for display)
    const ethNeeded = usdToEth(Number(usdAmount));
    const ethNeededFixed = Number(ethNeeded.toFixed(8)); // numeric for consistency

    // Build unsigned tx draft (very simple example)
    const paymentTo = process.env.PAYMENT_ADDRESS || DEFAULT_PAYMENT_ADDRESS;
    const unsignedTx = {
      to: paymentTo,
      // value in ETH (string for display)
      valueEth: ethNeededFixed.toFixed(8),
      // put any data you want — here empty
      data: "0x"
    };

    // Response: frontend can show value and save reminder (we don't send on-chain here)
    return res.status(200).json({
      ok: true,
      fid,
      usdAmount,
      ethNeeded: ethNeededFixed,
      unsignedTx,
      note: "This is a payment draft; no chain tx was submitted."
    });
  } catch (err) {
    console.error("Error in /api/pay:", err);
    return res.status(500).json({ ok: false, error: "Server error creating payment draft." });
  }
};
