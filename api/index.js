const fs = require("fs");
const path = require("path");

module.exports = function handler(req, res) {
  // sadece GET
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  // repo root'taki index.html dosyasını oku
  const filePath = path.join(process.cwd(), "index.html");

  try {
    const html = fs.readFileSync(filePath, "utf8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (err) {
    console.error("index.html okunamadı:", err);
    return res
      .status(500)
      .send("Beklenmeyen bir hata oldu (index.html bulunamadı).");
  }
};
