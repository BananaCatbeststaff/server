export default function handler(req, res) {
  res.status(200).send(`
    <html>
      <head>
        <title>API Key Verify</title>
        <style>
          body { font-family: Arial, sans-serif; background: #121212; color: #eee; padding: 2rem; }
          h1 { color: #4caf50; }
          code { background: #333; padding: 2px 6px; border-radius: 4px; }
          a { color: #61dafb; }
          .container { max-width: 600px; margin: auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>API de Verificação de Key - Online</h1>
          <p>Esta é a API backend para verificação de key + HWID.</p>
          <p>Use o endpoint:</p>
          <code>/api/verify?key=YOUR_KEY&hwid=YOUR_HWID</code>
          <p>Para testar, você pode acessar diretamente a URL, por exemplo:</p>
          <a href="/api/verify?key=teste&hwid=abc123" target="_blank">/api/verify?key=teste&hwid=abc123</a>
          <p>Ela retornará JSON com o resultado da verificação.</p>
        </div>
      </body>
    </html>
  `);
}
