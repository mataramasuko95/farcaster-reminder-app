// api/pay.js
// This serverless function creates a mock "payment draft" for the reminder.
// It does NOT actually send a transaction onchain.

function usdToEth(usdAmount) {
  // fake rate: 1 ETH = 3000 USD
  const rate = 3000;
  return usdAmount / rate;
}

module.exports = function handler(req, res) {
  // only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Only POST allowed. Send JSON body.",
    });
  }

  try {
    // we expect { note, datetimeISO } from the client
    const { note, datetimeISO } = req.body || {};

    // basic validation
    if (!note || !datetimeISO) {
      return res.status(400).json({
        ok: false,
        error: "note and datetimeISO are required.",
        exampleBody: {
          note: "Pay rent",
          datetimeISO: "2025-10-27T12:30:00.000Z",
        },
      });
    }

    // mock fixed values
    const fid = 1234;
    const usdAmount = 0.05;
    const ethAddress = "0xABC01234567890abcdef1234567890ABCDEF12";

    // convert USD to ETH
    const ethNeeded = usdToEth(usdAmount);
    const valueEthStr = ethNeeded.toFixed(8); // "0.00001667" style

    // make a (not-sent) tx draft object
    const unsignedTx = {
      to: ethAddress,
      valueEth: valueEthStr,
      data: "0x", // no calldata for now
    };

    return res.status(200).json({
      ok: true,
      message: "Draft only. Not sent.",
      fid,
      note,
      datetimeISO,
      usdAmount,
      ethNeeded,
      unsignedTx,
    });
  } catch (err) {
    console.error("pay.js error:", err);
    return res.status(500).json({
      ok: false,
      error: "Unexpected server error while building draft.",
    });
  }
};

