const fs = require("fs")
const path = require("path")
const whitelistPath = path.resolve(__dirname, "../whitelist.json")

module.exports = (req, res) => {
  const { key, hwid } = req.query

  // Validar apenas a key (hwid não é obrigatório)
  if (!key) {
    return res.status(400).json({ success: false, error: "Faltando key" })
  }

  let whitelist = {}
  if (fs.existsSync(whitelistPath)) {
    whitelist = JSON.parse(fs.readFileSync(whitelistPath, "utf8"))
  }

  const entry = whitelist[key]
  if (!entry) {
    return res.json({ success: false, error: "Key inválida" })
  }

  // Se a entrada não tem HWID definido ou está vazia
  if (!entry.hwid || entry.hwid === "") {
    // Se não foi fornecido HWID, apenas confirma que a key é válida
    if (!hwid) {
      return res.json({ 
        success: true, 
        message: "Key válida - HWID não vinculado ainda",
        requiresHwid: false
      })
    }
    
    // Se foi fornecido HWID, vincula pela primeira vez
    entry.hwid = hwid
    fs.writeFileSync(whitelistPath, JSON.stringify(whitelist, null, 2), "utf8")
    return res.json({ 
      success: true, 
      action: "HWID vinculado",
      message: "HWID foi vinculado com sucesso à key"
    })
  }

  // Se a entrada já tem HWID definido, então o HWID se torna obrigatório
  if (!hwid) {
    return res.status(400).json({ 
      success: false, 
      error: "HWID é obrigatório para esta key",
      requiresHwid: true
    })
  }

  // Verificar se o HWID corresponde
  if (entry.hwid === hwid) {
    return res.json({ 
      success: true,
      message: "Autenticação bem-sucedida"
    })
  }

  // HWID não corresponde
  return res.json({ 
    success: false, 
    error: "HWID não corresponde" 
  })
}
