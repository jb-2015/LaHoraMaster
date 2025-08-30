// server.js (CommonJS, sin complicaciones)
const express = require("express");
const http = require("http");
const path = require("path");

const app = express();

// ⚠️ Cambiá esto o ponelo como variable de entorno RADIO_URL en Render
const RADIO_URL = process.env.RADIO_URL || "http://88.150.230.110:10138/;";


app.use(express.static(path.join(__dirname, "public")));

app.get("/radio", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "audio/mpeg");

  const upstream = http.get(
    RADIO_URL,
    { headers: { "Icy-MetaData": "1", "User-Agent": "RadioProxy/1.0" } },
    (r) => {
      // Si el servidor manda otro content-type (ej. aacp), lo respetamos
      if (r.headers["content-type"])
        res.setHeader("Content-Type", r.headers["content-type"]);
      r.pipe(res);
    }
  );

  upstream.on("error", () => {
    if (!res.headersSent) res.status(502).end("No se pudo conectar al stream");
    else res.end();
  });

  // Si el cliente cierra, cortamos upstream
  res.on("close", () => upstream.destroy());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Servidor listo en http://localhost:${PORT}`)
);
