import { getAssistantCatalog } from "../../../lib/assistant-index";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const role = ["teacher", "student", "admin", "supervisor"].includes(req.query.role) ? req.query.role : "teacher";
  const language = typeof req.query.language === "string" ? req.query.language : "en";
  const product = typeof req.query.product === "string" ? req.query.product : "";
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json(getAssistantCatalog({ language, role, product }));
}
