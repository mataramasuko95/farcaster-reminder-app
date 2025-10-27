const fs = require("fs");
const path = require("path");

module.exports = function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  const filePath = path.join(process.cwd(), "index.html");

  try {
    const html = fs.readFileSync(filePath, "utf8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (err) {
    console.error("index.html okunamadı:", err);
    res.status(500).send("Beklenmeyen bir hata oldu (index.html bulunamadı).");
  }
};
