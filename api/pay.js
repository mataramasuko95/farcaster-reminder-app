// api/pay.js
//
// This endpoint pretends to create a payment draft for the reminder.
// In production you'd build a real tx that pays ~0.05 USD in ETH.
// Right now we just simulate it and respond with mock numbers.

function usdToEth(usdAmount) {
  // super fake conversion: assume 1 ETH = 3000 USD
  const eth = usdAmount / 3000;
  return eth;
}

module.exports = async function handler(req, res) {
  // Only POST is allowed
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Only POST allowed. Send JSON body.",
    });
  }

  try {
    const { note, dateISO, timeISO } = req.body || {};

    // basic validation
    if (!note || !dateISO || !timeISO) {
      return res.status(400).json({
        ok: false,
        error: "note, dateISO, and timeISO are required.",
        exampleBody: {
          note: "Team call",
          dateISO: "2025-10-15",
          timeISO: "18:30",
        },
      });
    }

    // pretend cost ~ $0.05
    const usdAmount = 0.05;
    const ethNeeded = usdToEth(usdAmount);

    // fake unsigned tx
    const unsignedTx = {
      to: "0xABC01234567890abcdef1234567890ABCDEF12",
      valueEth: ethNeeded.toFixed(8), // string
      data: "0x", // no data for now
    };

    // build nice human info
    const costEth = ethNeeded.toFixed(8);
    // ~0.05 USD
    const costUsd = usdAmount.toFixed(2);

    // respond with a "draft"
    return res.status(200).json({
      ok: true,
      message: "Payment draft created",
      paymentDraft: {
        costEth,
        costUsd,
        unsignedTx,
      },
    });
  } catch (err) {
    console.error("pay.js error:", err);
    return res.status(500).json({
      ok: false,
      error: "Unexpected server error while creating draft.",
    });
  }
};


