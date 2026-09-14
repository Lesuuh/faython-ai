import type { ChatMessage, Conversation } from "./chat-store";
import { slugify } from "./chat-store";
import { recordExport } from "./file-store";

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function blockToHtml(text: string): string {
  return esc(text)
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

function docHtml(title: string, meta: string, segments: { title: string; body: string }[]): string {
  const body = segments.map((s) => `<h2>${esc(s.title)}</h2>${blockToHtml(s.body)}`).join("");
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8"/>
<title>${esc(title)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #111111; }
  h1 { font-size: 17pt; margin: 0 0 4px 0; }
  h2 { font-size: 13pt; margin: 18px 0 6px 0; border-bottom: 1px solid #cccccc; }
  p { margin: 0 0 8px 0; }
  .meta { color: #666666; font-size: 9pt; margin-bottom: 24px; }
</style>
</head>
<body>
<h1>${esc(title)}</h1>
<p class="meta">${esc(meta)}</p>
${body}
</body>
</html>`;
}

function download(filename: string, html: string): void {
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function latestChapters(messages: ChatMessage[]): { chapterNumber: number; content: string }[] {
  const byNumber = new Map<number, string>();
  for (const m of messages) {
    if (m.role === "assistant" && m.mode === "chapter" && m.chapterNumber && m.content) {
      byNumber.set(m.chapterNumber, m.content);
    }
  }
  return [...byNumber.entries()]
    .map(([chapterNumber, content]) => ({ chapterNumber, content }))
    .sort((a, b) => a.chapterNumber - b.chapterNumber);
}

export function exportConversationDocx(
  conversation: Conversation,
  opts?: { record?: boolean },
): void {
  const date = new Date(conversation.updatedAt).toLocaleString();
  const chapters = latestChapters(conversation.messages);
  const segments = chapters.length
    ? chapters.map((c) => ({ title: `Chapter ${c.chapterNumber}`, body: c.content }))
    : conversation.messages.map((m) => ({
        title: m.role === "user" ? "User" : "Faython Scholar",
        body: m.content,
      }));
  const meta = chapters.length
    ? `Generated ${date} · Faython Scholar · ${chapters.length} ${
        chapters.length === 1 ? "chapter" : "chapters"
      }`
    : `Generated ${date} · Faython Scholar`;
  download(`${slugify(conversation.title)}.doc`, docHtml(conversation.title, meta, segments));
  if (opts?.record !== false) recordExport(conversation.title, "conversation", conversation.id);
}