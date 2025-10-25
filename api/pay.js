// api/pay.js

// USD -> ETH çevirme (sahte kur: 1 ETH = 3000 USD)
function usdToEth(usdAmount) {
  const eth = usdAmount / 3000;
  return eth;
}

// Vercel edge/serverless formatında default export
export default function handler(req, res) {
  // Sadece POST kabul et
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Only POST allowed. Send JSON body.",
    });
  }

  try {
    // Body'den bilgileri al
    const { fid, usdAmount, ethAddress } = req.body || {};

    // Basit validation
    if (!fid || !usdAmount || !ethAddress) {
      return res.status(400).json({
        ok: false,
        error: "fid, usdAmount, ethAddress zorunlu.",
        exampleBody: {
          fid: 1234,
          usdAmount: 0.05,
          ethAddress: "0xABCDEF....",
        },
      });
    }

    // Kaç ETH lazım?
    const ethNeeded = usdToEth(Number(usdAmount));

    // Henüz imzalanmamış tx taslağı
    const unsignedTx = {
      to: ethAddress,
      valueEth: ethNeeded.toFixed(8),
      data: "0x",
    };

    // Demo response (henüz zincire göndermiyoruz)
    return res.json({
      ok: true,
      fid,
      usdAmount,
      ethNeeded: Number(ethNeeded.toFixed(8)),
      unsignedTx,
      note: "Bu sadece taslak tx. Henüz zincire gönderilmedi.",
    });
  } catch (err) {
    console.error("pay endpoint error:", err);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}
