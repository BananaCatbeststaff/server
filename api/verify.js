const fs = require("fs");
const path = require("path");

// Função para ler o arquivo whitelist
function readWhitelist() {
  try {
    const whitelistPath = path.join(__dirname, "whitelist.json");
    console.log("Tentando ler whitelist em:", whitelistPath);
    console.log("Arquivo existe?", fs.existsSync(whitelistPath));
    
    if (fs.existsSync(whitelistPath)) {
      const data = fs.readFileSync(whitelistPath, "utf8");
      console.log("Conteúdo do arquivo:", data);
      const parsed = JSON.parse(data);
      console.log("Dados parseados:", parsed);
      console.log("Keys disponíveis:", Object.keys(parsed));
      return parsed;
    }
    
    console.log("Arquivo whitelist.json não encontrado!");
    return {};
  } catch (error) {
    console.error("Erro ao ler whitelist:", error);
    return {};
  }
}

// Função para salvar o arquivo whitelist
function saveWhitelist(whitelist) {
  try {
    const whitelistPath = path.join(__dirname, "whitelist.json");
    fs.writeFileSync(whitelistPath, JSON.stringify(whitelist, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Erro ao salvar whitelist:", error);
    return false;
  }
}

module.exports = (req, res) => {
  // Log para debug
  console.log("API chamada - Método:", req.method);
  console.log("Body:", req.body);

  try {
    // Configurar headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Verificar método
    if (req.method !== 'POST') {
      res.status(405).json({ 
        success: false, 
        error: "Método não permitido. Use POST." 
      });
      return;
    }

    // Extrair dados
    let body = req.body;
    
    // Se body é string, fazer parse
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        res.status(400).json({ 
          success: false, 
          error: "JSON inválido" 
        });
        return;
      }
    }

    const { key, hwid } = body || {};
    console.log("Key recebida:", key);
    console.log("HWID recebido:", hwid);

    // Validar key
    if (!key) {
      res.status(400).json({ 
        success: false, 
        error: "Key missing" 
      });
      return;
    }

    // Ler whitelist
    const whitelist = readWhitelist();
    console.log("Whitelist carregada:", whitelist);
    
    // Verificar se key existe
    if (!whitelist[key]) {
      console.log("Key não encontrada na whitelist");
      res.status(401).json({ 
        success: false, 
        error: "Key inválida" 
      });
      return;
    }

    const keyData = whitelist[key];

    // Se HWID não está definido ou está vazio, vincular
    if (!keyData.hwid || keyData.hwid === "") {
      keyData.hwid = hwid || "";
      
      if (saveWhitelist(whitelist)) {
        res.json({ 
          success: true, 
          action: "HWID vinculado",
          message: "HWID foi vinculado com sucesso à key",
          discordId: keyData.discordId
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: "Erro ao salvar dados" 
        });
      }
      return;
    }

    // Verificar se HWID corresponde
    if (keyData.hwid === hwid) {
      res.json({ 
        success: true,
        message: "Autenticação bem-sucedida",
        discordId: keyData.discordId
      });
      return;
    }

    // HWID não corresponde
    res.status(403).json({ 
      success: false, 
      error: "HWID não corresponde" 
    });

  } catch (error) {
    console.error("Erro geral na API:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erro interno do servidor",
      details: error.message
    });
  }
};
