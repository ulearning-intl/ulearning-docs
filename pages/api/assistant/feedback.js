import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const directory = path.resolve(process.cwd(), ".assistant-data");

export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }
  const { type, feedbackId, action, user, question } = req.body || {};
  if (!["like", "dislike", "handoff"].includes(type) || typeof feedbackId !== "string"
      || !/^[\w-]{1,150}$/.test(feedbackId)) return res.status(400).end();
  const event = { type, feedbackId, action: action === "delete" ? "delete" : "create", time: new Date().toISOString() };
  if (event.action === "create") {
    if (typeof question !== "string" || !question.trim() || question.length > 5000) return res.status(400).end();
    event.question = question;
    event.user = typeof user === "string" ? user.slice(0, 80) : "";
  }
  try {
    await mkdir(directory, { recursive: true });
    await appendFile(path.join(directory, "feedback.jsonl"), JSON.stringify(event) + "\n", "utf8");
    return res.status(204).end();
  } catch (error) {
    console.error("Could not save Little Bee feedback", error);
    return res.status(500).end();
  }
}
