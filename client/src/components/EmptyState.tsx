import type { ReactNode } from "react";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  actions?: ReactNode;
  compact?: boolean;
};

const defaultIllustration = (
  <svg viewBox="0 0 120 120" role="img" aria-hidden="true" className="empty-illus-svg">
    <defs>
      <linearGradient id="p-soft" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F0EEFF" />
        <stop offset="1" stopColor="#E8E4FF" />
      </linearGradient>
      <linearGradient id="p-line" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#6D5CE7" />
        <stop offset="1" stopColor="#5B4BC4" />
      </linearGradient>
    </defs>
    <rect x="6" y="18" width="108" height="84" rx="10" fill="url(#p-soft)" />
    <rect x="40" y="44" width="40" height="5" rx="2.5" fill="#D8D2FF" />
    <rect x="40" y="56" width="52" height="5" rx="2.5" fill="#D8D2FF" />
    <rect x="40" y="68" width="28" height="5" rx="2.5" fill="#D8D2FF" />
    <rect x="30" y="24" width="10" height="10" rx="3" fill="#E0DBFF" />
    <rect x="18" y="14" width="96" height="12" rx="6" fill="#FFFFFF" stroke="#D8D2FF" strokeWidth="1.2" />
    <path d="M20 72h62" stroke="#6D5CE7" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
    <path d="M16 88c5-8 12-3 17-9s9-6 14-10" stroke="#6D5CE7" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.8" />
    <circle cx="46" cy="68" r="2.4" fill="#6D5CE7" />
    <circle cx="60" cy="78" r="3" fill="#5B4BC4" />
  </svg>
);

export function EmptyState({ eyebrow, title, body, actions, compact }: EmptyStateProps) {
  return (
    <div className={`empty-state ${compact ? "empty-state-compact" : ""}`}>
      <div className="empty-illus">{defaultIllustration}</div>
      {eyebrow && <p className="empty-eyebrow">{eyebrow}</p>}
      <h3>{title}</h3>
      {body && <p className="empty-body">{body}</p>}
      {actions && <div className="empty-actions">{actions}</div>}
    </div>
  );
}
