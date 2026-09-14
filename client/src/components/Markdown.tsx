import { Fragment, type ReactNode } from "react";

type Block =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "p"; text: string };

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function parseBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const type = level <= 1 ? "h1" : level === 2 ? "h2" : "h3";
      blocks.push({ type, text: heading[2].trim() });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [line.replace(/^[-*]\s+/, "")];
      while (i + 1 < lines.length && /^[-*]\s+/.test(lines[i + 1])) {
        items.push(lines[i + 1].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [line.replace(/^\d+\.\s+/, "")];
      while (i + 1 < lines.length && /^\d+\.\s+/.test(lines[i + 1])) {
        items.push(lines[i + 1].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    if (!line.trim()) continue;
    blocks.push({ type: "p", text: line });
  }
  return blocks;
}

export function Markdown({ text }: { text: string }) {
  const blocks = parseBlocks(text.split("\n"));

  return (
    <div className="text-[14px] leading-[1.7] text-foreground">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h1":
            return (
              <h3 key={i} className="mb-2 mt-5 text-[17px] font-bold tracking-[-0.01em] first:mt-0">
                {renderInline(b.text)}
              </h3>
            );
          case "h2":
            return (
              <h4 key={i} className="mb-2 mt-5 text-[15px] font-semibold tracking-[-0.01em] first:mt-0">
                {renderInline(b.text)}
              </h4>
            );
          case "h3":
            return (
              <p key={i} className="mb-2 mt-4 text-[14px] font-semibold first:mt-0">
                {renderInline(b.text)}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="my-2 grid list-disc gap-1 pl-5 marker:text-primary">
                {b.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="my-2 grid list-decimal gap-1 pl-5 marker:text-primary">
                {b.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          default:
            return (
              <p key={i} className="my-2">
                {renderInline(b.text)}
              </p>
            );
        }
      })}
    </div>
  );
}