import fs from "fs";
import path from "path";
import { getAssistantImage } from "../../../lib/assistant-index";

const TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const file = getAssistantImage(req.query.path);
  if (!file) {
    res.status(404).end();
    return;
  }
  res.setHeader("Content-Type", TYPES[path.extname(file).toLowerCase()] || "application/octet-stream");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.status(200).send(fs.readFileSync(file));
}
