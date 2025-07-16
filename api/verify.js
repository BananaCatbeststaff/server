const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  const { key, hwid } = req.query;

  if (!key) {
    return res.status(400).json({ success: false, error: "Key missing" });
  }

  const whitelistPath = path.resolve(__dirname, "whitelist.json");

  let whitelist = {};
  if (fs.existsSync(whitelistPath)) {
    whitelist = JSON.parse(fs.readFileSync(whitelistPath, "utf8"));
  }

  if (!whitelist[key]) {
    return res.json({ success: false, error: "Key inválida" });
  }

  if (!whitelist[key].hwid) {
    whitelist[key].hwid = hwid || "";
    fs.writeFileSync(whitelistPath, JSON.stringify(whitelist, null, 2), "utf8");
    return res.json({ success: true, action: "HWID vinculado" });
  }

  if (whitelist[key].hwid === hwid) {
    return res.json({ success: true });
  }

  return res.json({ success: false, error: "HWID não corresponde" });
};
