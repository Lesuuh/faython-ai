import { Router, type Request } from "express";
import multer from "multer";
import { z } from "zod";
import { asyncHandler } from "../lib/async.js";
import { validate } from "../lib/validate.js";
import { badRequest } from "../lib/errors.js";
import { n8n } from "../services/n8n.service.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image uploads are supported."));
  },
});

const bodySchema = z.object({
  prompt: z.string().optional(),
  level: z.string().optional(),
  discipline: z.string().optional(),
});

function detectLevel(text: string): string | undefined {
  const t = text.toLowerCase();
  if (t.includes("postgraduate") || t.includes("post-graduate") || t.includes("masters") || t.includes("msc") || t.includes("phd") || t.includes("postgrad")) return "postgraduate";
  if (t.includes("undergraduate") || t.includes("undergrad") || t.includes("bsc") || t.includes("hnd") || t.includes("b.ed") || t.includes("btech")) return "undergraduate";
  return undefined;
}

const LEVELS = new Map([
  ["accounting", "Accounting"],
  ["computer science", "Computer Science"],
  ["nursing", "Nursing"],
  ["business", "Business"],
  ["economics", "Economics"],
  ["education", "Education"],
  ["engineering", "Engineering"],
  ["law", "Law"],
  ["medicine", "Medicine"],
  ["psychology", "Psychology"],
  ["mass communication", "Mass Communication"],
  ["marketing", "Marketing"],
  ["biology", "Biology"],
  ["chemistry", "Chemistry"],
  ["physics", "Physics"],
  ["political science", "Political Science"],
  ["sociology", "Sociology"],
  ["agriculture", "Agriculture"],
  ["public health", "Public Health"],
]);

function detectDiscipline(text: string): string | undefined {
  const t = text.toLowerCase();
  for (const [key, label] of LEVELS) {
    if (t.includes(key)) return label;
  }
  if (t.includes("ai") || t.includes("artificial intelligence")) return "Artificial Intelligence";
  if (t.includes("fintech") || t.includes("finance")) return "Finance";
  return undefined;
}

// POST /api/chat — generate a topic list via n8n (text and/or image)
router.post(
  "/",
  upload.single("file"),
  asyncHandler(async (req: Request, res) => {
    const body = validate(bodySchema)(req.body ?? {});
    const prompt = (body.prompt || "").trim();
    const file = req.file;

    let promptForUser = prompt;
    let imageDataUrl: string | undefined;

    if (file) {
      imageDataUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      promptForUser = prompt || "Image prompt";
    }
    if (!promptForUser) throw badRequest("A text prompt is required.");

    const reply = await n8n.generateTopics(promptForUser, {
      ...(imageDataUrl ? { imageDataUrl } : {}),
      ...(body.level || detectLevel(promptForUser) ? { level: body.level || detectLevel(promptForUser) } : {}),
      ...(body.discipline || detectDiscipline(promptForUser) ? { discipline: body.discipline || detectDiscipline(promptForUser) } : {}),
    });

    res.status(200).json({ reply });
  }),
);

export default router;