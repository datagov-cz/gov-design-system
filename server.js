import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 8080;

/* Support CORS. */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.header("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

// Order matters: patch overrides html, html overrides dist,
// mirroring the layering done by COPY order in the Dockerfile.
app.use(express.static(path.join(__dirname, "patch")));
app.use(express.static(path.join(__dirname, "html")));
app.use(express.static(path.join(__dirname, "dist")));

app.use("/pages", express.static(path.join(__dirname, "pages")));

// Use custom 404 page.
app.use((_req, res) => {
  res.status(404).sendFile(path.join(__dirname, "html", "40x.html"));
});

app.listen(port, () => {
  console.log(`Gov design system running at http://localhost:${port}.`);
});
