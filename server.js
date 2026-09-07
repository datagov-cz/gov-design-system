/**
 * This should be used only as a local dev-server to test the content.
 * Do NOT use this in production, use the full Docker image instead.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
// Port for the dev server; override with the PORT env variable.
const port = process.env.NGINX_PORT || 8080;

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
