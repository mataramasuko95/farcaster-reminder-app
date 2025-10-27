// api/pay.js
// Bu endpoint "payment draft" üretir. Gerçek ağdaki tx'i HENÜZ göndermiyor.
// Client (index.html) burayı POST eder, biz de geri ödeme taslağını döneriz.

module.exports = function handler(req, res) {
  // Sadece POST'e izin veriyoruz.
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Only POST allowed. Send JSON body."
    });
  }

  try {
    // body'den reminder bilgisini alıyoruz
    // (index.html şu alanları yolluyor olacak)
    const {
      note,          // string: kullanıcının yazdığı hatırlatma
      datetimeISO,   // string ISO tarih: "2025-10-09T18:44"
      usdAmount      // sayı: kaç USD değerlik ödeme istiyoruz (ör: 0.05)
    } = req.body || {};

    // Basit validation
    if (!note || !datetimeISO || !usdAmount) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: note, datetimeISO, usdAmount"
      });
    }

    // Ödemelerin gideceği adres = SENİN ADRESİN 💸
    const PAYMENT_ADDRESS = "0xfA34687f5BdCF7DcBeBbF00e7A81c38188cf6772";

    // USD -> ETH çevirme (şu an sahte sabit kur)
    // Varsayım: 1 ETH = 3000 USD
    // Bunu sonra gerçek on-chain/price feed'e çekebiliriz ama MVP için sabit.
    const usdToEth = (usd) => {
      const eth = usd / 3000;
      return eth;
    };

    const ethNeeded = usdToEth(Number(usdAmount));

    // Ethereum tx taslağı:
    // value (wei değil ETH string olarak gösteriyoruz UI için),
    // data: "0x" => normal ETH transferi
    const unsignedTx = {
      to: PAYMENT_ADDRESS,
      valueEth: ethNeeded.toFixed(8), // "0.00001667" gibi
      data: "0x"
    };

    // Kullanıcıya geri döndüğümüz şey:
    // - reminder içeriği
    // - tarih
    // - tahmini ödeme
    // - tx taslağı
    return res.status(200).json({
      ok: true,
      reminder: {
        note,
        datetimeISO
      },
      payment: {
        usdAmount,
        ethNeeded,
        approxUsd: usdAmount, // zaten usdAmount
        unsignedTx,
        disclaimer:
          "This is only a draft transaction. It has NOT been sent or signed yet."
      }
    });
  } catch (err) {
    console.error("pay.js error:", err);
    return res.status(500).json({
      ok: false,
      error: "Unexpected error in /api/pay"
    });
  }
};

