// usdToEth
function usdToEth(usdAmount) {
  const eth = usdAmount / 3000;
  return eth;
}

module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Only POST allowed. Send JSON body.",
    });
  }

  try {
    const { fid, usdAmount, ethAddress } = req.body || {};

    if (!fid || !usdAmount || !ethAddress) {
      return res.status(400).json({
        ok: false,
        error: "fid, usdAmount, ethAddress zorunlu.",
        exampleBody: {
          fid: 1234,
          usdAmount: 0.05,
          ethAddress: "0xABCDEF...",
        },
      });
    }

    const ethNeeded = usdToEth(Number(usdAmount));

    const unsignedTx = {
      to: ethAddress,
      valueEth: ethNeeded.toFixed(8),
      data: "0x",
    };

    return res.status(200).json({
      ok: true,
      fid,
      usdAmount,
      ethNeeded,
      unsignedTx,
      note: "Bu sadece taslak tx. Henüz zincire gönderilmedi.",
    });
  } catch (err) {
    console.error("pay endpoint error:", err);
    return res.status(500).json({
      ok: false,
      error: "internal_error",
    });
  }
};

