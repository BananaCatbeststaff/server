const fs = require("fs");
const path = require("path");

module.exports = async (req, res) => {
  try {
    // Configurar CORS se necessário
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Rejeita requisições que não sejam POST
    if (req.method !== "POST") {
      return res.status(405).json({ 
        success: false, 
        error: "Método não permitido. Use POST." 
      });
    }

    // Parse do body se necessário
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ 
          success: false, 
          error: "JSON inválido" 
        });
      }
    }

    const { key, hwid } = body;

    // Validação da key
    if (!key) {
      return res.status(400).json({ 
        success: false, 
        error: "Key missing" 
      });
    }

    // Caminho para o arquivo whitelist
    const whitelistPath = path.resolve(process.cwd(), "whitelist.json");
    
    let whitelist = {};
    
    // Lê o arquivo whitelist se existir
    try {
      if (fs.existsSync(whitelistPath)) {
        const whitelistData = fs.readFileSync(whitelistPath, "utf8");
        whitelist = JSON.parse(whitelistData);
      }
    } catch (error) {
      console.error("Erro ao ler whitelist:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Erro interno do servidor" 
      });
    }

    // Verifica se a key existe na whitelist
    if (!whitelist[key]) {
      return res.status(401).json({ 
        success: false, 
        error: "Key inválida" 
      });
    }

    // Se não há HWID vinculado, vincula o atual
    if (!whitelist[key].hwid || whitelist[key].hwid === "") {
      whitelist[key].hwid = hwid || "";
      
      try {
        fs.writeFileSync(whitelistPath, JSON.stringify(whitelist, null, 2), "utf8");
        return res.json({ 
          success: true, 
          action: "HWID vinculado",
          message: "HWID foi vinculado com sucesso à key",
          discordId: whitelist[key].discordId
        });
      } catch (error) {
        console.error("Erro ao salvar whitelist:", error);
        return res.status(500).json({ 
          success: false, 
          error: "Erro ao salvar dados" 
        });
      }
    }

    // Verifica se o HWID corresponde
    if (whitelist[key].hwid === hwid) {
      return res.json({ 
        success: true,
        message: "Autenticação bem-sucedida",
        discordId: whitelist[key].discordId
      });
    }

    // HWID não corresponde
    return res.status(403).json({ 
      success: false, 
      error: "HWID não corresponde" 
    });

  } catch (error) {
    console.error("Erro na API:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Erro interno do servidor" 
    });
  }
};
