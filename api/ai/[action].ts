// @ts-nocheck
export default function handler(req, res) {
  return res.status(501).json({ success: false, error: "AI server route disabled." });
}
