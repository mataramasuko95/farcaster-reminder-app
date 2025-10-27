// api/pay.js
//
// This endpoint receives { note, datetimeISO } from the client
// and returns a mock payment draft + fee estimation.
// It NEVER actually sends a tx. It's just a preview.

function usdToEth(usdAmount) {
  // fake conversion: 1 ETH = 3000 USD
  const eth = usdAmount / 3000;
  return eth;
}

// helper: format a tiny USD estimate from ETH
function approximateUsdFromEth(eth) {
  // inverse of usdToEth() math above
  // if eth = 0.000017 => usd ≈ eth * 3000
  const usd = eth * 3000;
  return usd;
}

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ ok: false, error: "Method Not Allowed. Use POST." });
  }

  try {
    // Parse body
    const { note, datetimeISO } = req.body || {};

    // Basic validation
    if (!note || !datetimeISO) {
      return res.status(400).json({
        ok: false,
        error: "Missing note or datetimeISO",
        exampleBody: {
          note: "Pay rent",
          datetimeISO: "2025-01-01T12:00:00.000Z",
        },
      });
    }

    // Our fixed mini-app fee in USD (e.g. $0.05)
    const usdAmount = 0.05;

    // Convert to ETH estimate (mock)
    const ethNeeded = usdToEth(usdAmount); // e.g. 0.0000166...

    // Build a fake unsigned tx
    // In a real flow, you'd build a proper calldata / to address etc.
    const unsignedTx = {
      to: "0xABC01234567890abcdef1234567890ABCDEF12",
      valueEth: ethNeeded.toFixed(8), // just for display
      data: "0x",
    };

    // Build the object we send back to the client/UI
    const result = {
      ok: true,
      note,
      datetimeISO,
      paymentDraft: {
        ethNeeded,
        usdAmount,
        unsignedTx,
        // also include a human string e.g. "0.000017 ETH (~$0.05)"
        pretty: `${ethNeeded.toFixed(6)} ETH (~$${approximateUsdFromEth(
          ethNeeded
        ).toFixed(2)})`,
      },
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error("pay.js error:", err);

    return res.status(500).json({
      ok: false,
      error: "Internal Server Error while creating draft",
    });
  }
};

