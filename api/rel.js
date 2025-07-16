const fs = require("fs")
const path = require("path")

const whitelistPath = path.resolve(__dirname, "../whitelist.json")

module.exports = (req, res) => {
  const { key, hwid } = req.query

  if (!key || !hwid) {
    return res.status(400).json({ success: false, error: "Faltando key ou hwid" })
  }

  let whitelist = {}
  if (fs.existsSync(whitelistPath)) {
    whitelist = JSON.parse(fs.readFileSync(whitelistPath, "utf8"))
  }

  const entry = whitelist[key]
  if (!entry) {
    return res.json({ success: false, error: "Key inválida" })
  }

  if (!entry.hwid || entry.hwid === "") {
    // vincula hwid pela primeira vez
    entry.hwid = hwid
    fs.writeFileSync(whitelistPath, JSON.stringify(whitelist, null, 2), "utf8")
    return res.json({ success: true, action: "HWID vinculado" })
  }

  if (entry.hwid === hwid) {
    return res.json({ success: true })
  }

  return res.json({ success: false, error: "HWID não corresponde" })
}
