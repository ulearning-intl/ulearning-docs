import { getAssistantAnswer } from "../../../lib/assistant-index";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const role = ["teacher", "student", "admin", "supervisor"].includes(body.role) ? body.role : "teacher";
  const result = getAssistantAnswer({
    message: body.message,
    language: body.language,
    role,
    product: body.product,
    documentId: body.documentId,
  });
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json(result);
}
