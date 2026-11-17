import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Bell,
  Check,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Download,
  Fingerprint,
  Globe,
  KeyRound,
  Laptop,
  Link2,
  LockKeyhole,
  Shield,
  Sparkles,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useProject } from "@/context/ProjectContext";
import { loadBilling } from "@/lib/billing-store";
import { formatDate } from "@/lib/format";
import {
  loadProfile,
  REFERENCING_STYLES,
  saveProfile,
  type AcademicLevel,
  type ResearchProfile,
} from "@/lib/profile-store";
import { PLANS, planById } from "@/lib/pricing";
import { getTokenAccount } from "@/lib/token-store";
import {
  applyTheme,
  dateFormatOptions,
  loadAppSettings,
  saveAppSettings,
  type AppSettings,
} from "@/lib/settings-store";
import type { Project } from "@/lib/project-store";
import { cx } from "@/lib/cx";

type SettingsSection =
  | "general"
  | "personalization"
  | "notifications"
  | "billing"
  | "usage"
  | "security"
  | "privacy"
  | "apps"
  | "help";

const SECTIONS: { id: SettingsSection; label: string; icon: ComponentType<{ size?: number | string }> }[] = [
  { id: "general", label: "General", icon: UserRound },
  { id: "personalization", label: "Personalisation", icon: Sparkles },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Subscription & Billing", icon: CreditCard },
  { id: "usage", label: "Usage & Tokens", icon: Wallet },
  { id: "security", label: "Security", icon: Shield },
  { id: "privacy", label: "Data & Privacy", icon: LockKeyhole },
  { id: "apps", label: "Connected Apps", icon: Link2 },
  { id: "help", label: "Help & Support", icon: CircleHelp },
];

const SECTION_COPY: Record<SettingsSection, { title: string; description: string }> = {
  general: { title: "General", description: "Manage your account profile and application preferences." },
  personalization: { title: "Personalisation", description: "Set global writing preferences. Project-specific context can take precedence." },
  notifications: { title: "Notifications", description: "Choose the updates and account notices you want to receive." },
  billing: { title: "Subscription & Billing", description: "Review your current plan and locally stored billing activity." },
  usage: { title: "Usage & Tokens", description: "Check your token balance and recent activity." },
  security: { title: "Security", description: "Review sign-in and security options available for this account." },
  privacy: { title: "Data & Privacy", description: "Export or manage the information stored by Faython on this device." },
  apps: { title: "Connected Apps", description: "Manage integrations for your academic workflow." },
  help: { title: "Help & Support", description: "Find help, contact the Faython team, and learn about this app." },
};

function SettingsCard({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx("rounded-xl border border-border bg-surface p-4 sm:p-5", className)}>{children}</section>;
}

function GroupHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {description && <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>}
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 rounded accent-primary"
      />
    </label>
  );
}

function ComingSoon() {
  return (
    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
      Coming soon
    </span>
  );
}

function projectExportShape(project: Project) {
  return project;
}

export function Settings() {
  const { user, appUser, loading } = useAuth();
  const { projects, updateProject } = useProject();
  const userId = user?.id ?? null;
  const billingUserId = user?.id ?? "guest";
  const [section, setSection] = useState<SettingsSection>("general");
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());
  const [profile, setProfile] = useState<ResearchProfile>(() => loadProfile(userId));
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setProfile(loadProfile(userId));
  }, [userId]);

  const displayName = user?.user_metadata?.full_name || appUser?.name || user?.email?.split("@")[0] || "Student";
  const email = appUser?.email || user?.email || "";
  const billing = loadBilling(billingUserId);
  const plan = planById(billing.planId);
  const tokenAccount = getTokenAccount(billingUserId, billing.planId);
  const monthlyUsage = tokenAccount.consumedThisPeriod;
  const providers = useMemo(() => {
    const list = user?.app_metadata?.providers;
    if (Array.isArray(list)) return list.filter((provider): provider is string => typeof provider === "string");
    const provider = user?.app_metadata?.provider;
    return typeof provider === "string" ? [provider] : [];
  }, [user]);
  const copy = SECTION_COPY[section];

  function updateSettings<K extends keyof AppSettings>(
    key: K,
    patch: Partial<AppSettings[K]>,
  ) {
    setSettings((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
  }

  function saveSettings() {
    try {
      saveAppSettings(settings);
      saveProfile(userId, {
        ...profile,
        referencingStyle: settings.personalization.referencingStyle,
      });
      applyTheme(settings.general.theme);
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save settings");
    }
  }

  function setProfileField<K extends keyof ResearchProfile>(key: K, value: ResearchProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function exportData() {
    const data = {
      exportedAt: new Date().toISOString(),
      account: { displayName, email },
      projects: projects.map(projectExportShape),
      profile,
      appSettings: settings,
      billing: loadBilling(billingUserId),
      usage: getTokenAccount(billingUserId, billing.planId),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "faython-data-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Your data export has been downloaded");
  }

  function clearChatHistory() {
    projects.forEach((project) => {
      updateProject(project.id, (current) => ({
        ...current,
        messages: [],
        conversations: (current.conversations ?? []).map((conversation) => ({
          ...conversation,
          messages: [],
        })),
      }));
    });
    setConfirmClear(false);
    toast.success("Chat history cleared. Saved documents were kept.");
  }

  const content = (() => {
    switch (section) {
      case "general":
        return (
          <div className="grid gap-4">
            <SettingsCard>
              <GroupHeading title="Profile" description="Your account identity and academic profile." />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Display name" htmlFor="settings-name" hint="Saved locally as an app preference; it does not change your sign-in provider profile.">
                  <Input
                    id="settings-name"
                    value={settings.general.displayName}
                    placeholder={displayName}
                    onChange={(event) => updateSettings("general", { displayName: event.target.value })}
                  />
                </Field>
                <Field label="Email address" htmlFor="settings-email" hint="Managed by your sign-in provider.">
                  <Input id="settings-email" value={email || "Guest account"} readOnly />
                </Field>
                <Field label="Institution" htmlFor="settings-institution">
                  <Input id="settings-institution" value={profile.university} onChange={(event) => setProfileField("university", event.target.value)} placeholder="University or institution" />
                </Field>
                <Field label="Programme" htmlFor="settings-course">
                  <Input id="settings-course" value={profile.course} onChange={(event) => setProfileField("course", event.target.value)} placeholder="Course or programme" />
                </Field>
              </div>
            </SettingsCard>
            <SettingsCard>
              <GroupHeading title="Application preferences" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Language" htmlFor="general-language">
                  <Input id="general-language" value={settings.general.language} readOnly />
                  <p className="mt-1.5 text-xs text-muted">English is the only interface language currently available.</p>
                </Field>
                <Field label="Timezone" htmlFor="general-timezone">
                  <Input id="general-timezone" value={settings.general.timezone} onChange={(event) => updateSettings("general", { timezone: event.target.value })} placeholder="Africa/Lagos" />
                </Field>
                <Field label="Theme" htmlFor="general-theme">
                  <Select
                    id="general-theme"
                    value={settings.general.theme}
                    onChange={(event) => {
                      const theme = event.target.value as AppSettings["general"]["theme"];
                      updateSettings("general", { theme });
                      applyTheme(theme);
                    }}
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </Select>
                </Field>
                <Field label="Date format" htmlFor="general-date">
                  <Select id="general-date" value={settings.general.dateFormat} onChange={(event) => updateSettings("general", { dateFormat: event.target.value })}>
                    <option value="MMM d, yyyy">Nov 17, 2026</option>
                    <option value="d MMM yyyy">17 Nov 2026</option>
                    <option value="MM/dd/yyyy">11/17/2026</option>
                    <option value="yyyy-MM-dd">2026-11-17</option>
                  </Select>
                </Field>
                <Field label="Default landing page" htmlFor="landing-page" className="sm:col-span-2">
                  <Select id="landing-page" value={settings.general.landingPage} onChange={(event) => updateSettings("general", { landingPage: event.target.value })}>
                    <option value="home">Home</option>
                    <option value="projects">Projects</option>
                  </Select>
                </Field>
              </div>
              <p className="mt-3 text-xs text-muted">
                Current date preview: {new Intl.DateTimeFormat(settings.general.language, dateFormatOptions(settings.general.dateFormat)).format(new Date())}
                {" · "}Timezone: {settings.general.timezone}
              </p>
            </SettingsCard>
          </div>
        );
      case "personalization":
        return (
          <div className="grid gap-4">
            <SettingsCard>
              <GroupHeading title="Default academic writing style" description="These are global defaults. Project-level context can take precedence." />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Writing language" htmlFor="writing-language">
                  <Select id="writing-language" value={settings.personalization.writingLanguage} onChange={(event) => updateSettings("personalization", { writingLanguage: event.target.value as AppSettings["personalization"]["writingLanguage"] })}>
                    <option>British English</option>
                    <option>American English</option>
                  </Select>
                </Field>
                <Field label="Academic tone" htmlFor="writing-tone">
                  <Select id="writing-tone" value={settings.personalization.tone} onChange={(event) => updateSettings("personalization", { tone: event.target.value })}>
                    <option>Formal academic</option>
                    <option>Clear and accessible</option>
                    <option>Concise and direct</option>
                  </Select>
                </Field>
                <Field label="Writing level" htmlFor="writing-level">
                  <Select id="writing-level" value={settings.personalization.writingLevel} onChange={(event) => updateSettings("personalization", { writingLevel: event.target.value })}>
                    <option>Undergraduate</option>
                    <option>Postgraduate</option>
                    <option>Doctoral</option>
                    <option>Adapt to each project</option>
                  </Select>
                </Field>
                <Field label="Referencing style" htmlFor="writing-reference">
                  <Select id="writing-reference" value={settings.personalization.referencingStyle} onChange={(event) => updateSettings("personalization", { referencingStyle: event.target.value })}>
                    {REFERENCING_STYLES.map((style) => <option key={style}>{style}</option>)}
                  </Select>
                </Field>
                <Field label="Response length" htmlFor="response-length" className="sm:col-span-2">
                  <Select id="response-length" value={settings.personalization.responseLength} onChange={(event) => updateSettings("personalization", { responseLength: event.target.value })}>
                    <option>Concise</option>
                    <option>Balanced</option>
                    <option>Detailed</option>
                  </Select>
                </Field>
                <Field label="AI behaviour preferences" htmlFor="ai-preferences" hint="For example: avoid unsupported claims, explain assumptions, never fabricate sources." className="sm:col-span-2">
                  <Textarea id="ai-preferences" value={settings.personalization.preferences} onChange={(event) => updateSettings("personalization", { preferences: event.target.value })} />
                </Field>
              </div>
              <div className="mt-5 border-t border-border pt-4">
                <GroupHeading title="Default research profile" description="Used to prefill new projects. Individual project details remain separate." />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Academic level" htmlFor="profile-level">
                    <Select id="profile-level" value={profile.level} onChange={(event) => setProfileField("level", event.target.value as AcademicLevel)}>
                      <option value="">Not specified</option>
                      <option value="undergraduate">Undergraduate</option>
                      <option value="postgraduate">Postgraduate</option>
                      <option value="phd">PhD</option>
                    </Select>
                  </Field>
                  <Field label="Chapter plan" htmlFor="chapter-plan">
                    <Input id="chapter-plan" value={profile.chapterNames.join(" · ")} readOnly />
                  </Field>
                </div>
              </div>
            </SettingsCard>
          </div>
        );
      case "notifications":
        return (
          <SettingsCard>
            <GroupHeading title="Notification preferences" description="Notification delivery is not yet connected to an email or push service. Preferences are saved on this device." />
            <ToggleRow title="In-app notifications" description="Show notices and updates inside Faython." checked={settings.notifications.inApp} onChange={(checked) => updateSettings("notifications", { inApp: checked })} />
            <ToggleRow title="Product updates" description="New features, improvements, and product announcements." checked={settings.notifications.productUpdates} onChange={(checked) => updateSettings("notifications", { productUpdates: checked })} />
            <ToggleRow title="Subscription reminders" description="Reminders about plan and billing changes." checked={settings.notifications.subscriptionReminders} onChange={(checked) => updateSettings("notifications", { subscriptionReminders: checked })} />
            <ToggleRow title="Token alerts" description="Notices when your available token balance is low." checked={settings.notifications.tokenAlerts} onChange={(checked) => updateSettings("notifications", { tokenAlerts: checked })} />
            <ToggleRow title="Account activity" description="Important sign-in and account notices." checked={settings.notifications.accountActivity} onChange={(checked) => updateSettings("notifications", { accountActivity: checked })} />
          </SettingsCard>
        );
      case "billing":
        return (
          <div className="grid gap-4">
            <SettingsCard>
              <GroupHeading title="Current plan" description="Plan and payment information are currently stored in this browser for preview purposes." />
              <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-foreground">{plan.name}</p>
                  <p className="mt-1 text-sm text-muted">{plan.tokensPerMonth.toLocaleString()} tokens per month</p>
                  <p className="mt-1 text-xs text-muted-foreground">Subscription status: local preview · Renewal date unavailable</p>
                </div>
                <ButtonLink to="/billing" variant="secondary">Manage plan</ButtonLink>
              </div>
            </SettingsCard>
            <SettingsCard>
              <GroupHeading title="Available plans" />
              <div className="grid gap-3 md:grid-cols-3">
                {PLANS.map((availablePlan) => (
                  <div key={availablePlan.id} className={cx("rounded-lg border p-4", availablePlan.id === billing.planId ? "border-primary-border bg-primary-soft/40" : "border-border bg-background")}>
                    <p className="text-sm font-semibold text-foreground">{availablePlan.name}</p>
                    <p className="mt-1 text-xs text-muted">{availablePlan.priceMonthly ? `$${availablePlan.priceMonthly}/month` : "Free"}</p>
                    <p className="mt-3 text-xs text-muted">{availablePlan.tokensPerMonth.toLocaleString()} monthly tokens</p>
                    {availablePlan.id === billing.planId && <p className="mt-3 text-xs font-medium text-primary">Current plan</p>}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted">Checkout is simulated in this preview; no real charge or production subscription is created.</p>
            </SettingsCard>
            <SettingsCard>
              <GroupHeading title="Billing history" />
              {billing.payments.length ? (
                <div className="divide-y divide-border">
                  {billing.payments.map((payment) => (
                    <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                      <div><p className="font-medium text-foreground">{payment.description}</p><p className="text-xs text-muted">{formatDate(payment.createdAt)} · {payment.reference}</p></div>
                      <span className="text-muted">{payment.currency} {payment.amount.toFixed(2)} · {payment.status}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted">No billing history is available in this browser.</p>}
            </SettingsCard>
          </div>
        );
      case "usage":
        return (
          <div className="grid gap-4">
            <SettingsCard>
              <GroupHeading title="Token balance" description="Usage and balances are stored locally and are not enforced server-side." />
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Available" value={tokenAccount.balance.toLocaleString()} />
                <Metric label="Total consumed" value={usageTotal(tokenAccount.ledger).toLocaleString()} />
                <Metric label="Used this month" value={monthlyUsage.toLocaleString()} />
                <Metric label="Monthly allowance" value={tokenAccount.grantedThisPeriod.toLocaleString()} />
              </div>
              <p className="mt-3 text-xs text-muted">Period started {tokenAccount.periodStart}</p>
            </SettingsCard>
            <SettingsCard>
              <GroupHeading title="Usage breakdown" />
              <div className="grid gap-2 sm:grid-cols-3">
                <Metric label="Topics" value={usageTotal(tokenAccount.ledger, "topics").toLocaleString()} />
                <Metric label="Chapters" value={usageTotal(tokenAccount.ledger, "chapter").toLocaleString()} />
                <Metric label="Questions" value={usageTotal(tokenAccount.ledger, "ask").toLocaleString()} />
              </div>
            </SettingsCard>
            <SettingsCard>
              <GroupHeading title="Token activity" />
              {tokenAccount.ledger.length ? (
                <div className="max-h-80 divide-y divide-border overflow-y-auto">
                  {[...tokenAccount.ledger].reverse().map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <div className="min-w-0"><p className="truncate font-medium text-foreground">{entry.note || entry.kind || entry.type}</p><p className="text-xs text-muted">{formatDate(entry.createdAt)}</p></div>
                      <span className={entry.amount < 0 ? "shrink-0 text-muted" : "shrink-0 text-success"}>{entry.amount > 0 ? "+" : ""}{entry.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted">No token activity yet.</p>}
            </SettingsCard>
          </div>
        );
      case "security":
        return (
          <div className="grid gap-4">
            <SettingsCard>
              <GroupHeading title="Sign-in method" description="Authentication is managed by the connected identity provider." />
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-4">
                <div className="flex items-center gap-3"><KeyRound size={17} className="text-primary" /><div><p className="text-sm font-medium text-foreground">Password management</p><p className="text-xs text-muted">Change or reset passwords through your provider.</p></div></div>
                <ComingSoon />
              </div>
            </SettingsCard>
            <SettingsCard>
              <GroupHeading title="Connected login providers" />
              {providers.length ? providers.map((provider) => (
                <div key={provider} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                  <span className="inline-flex items-center gap-2 text-sm text-foreground"><Fingerprint size={16} />{provider}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-success"><Check size={14} /> Connected</span>
                </div>
              )) : <p className="text-sm text-muted">No connected provider details are available for this session.</p>}
            </SettingsCard>
            <SettingsCard>
              <GroupHeading title="Sessions & two-factor authentication" />
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center gap-3"><Laptop size={17} className="text-primary" /><div><p className="text-sm font-medium text-foreground">Current browser session</p><p className="text-xs text-muted">This session is active.</p></div></div>
                  <span className="text-xs text-success">Current</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center gap-3"><Shield size={17} className="text-primary" /><div><p className="text-sm font-medium text-foreground">Two-factor authentication</p><p className="text-xs text-muted">Not managed by Faython yet.</p></div></div>
                  <ComingSoon />
                </div>
              </div>
            </SettingsCard>
          </div>
        );
      case "privacy":
        return (
          <div className="grid gap-4">
            <SettingsCard>
              <GroupHeading title="Your data" description="Download a copy of the project and preference data currently available in this browser." />
              <Button variant="secondary" onClick={exportData}><Download size={15} /> Export personal data</Button>
            </SettingsCard>
            <SettingsCard>
              <GroupHeading title="Manage stored data" />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm font-medium text-foreground">Files & documents</p><p className="text-xs text-muted">Review project materials and exported documents.</p></div>
                <ButtonLink to="/files" variant="secondary">Manage files</ButtonLink>
              </div>
              <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm font-medium text-foreground">Clear chat history</p><p className="text-xs text-muted">Removes conversation messages but keeps projects and saved documents.</p></div>
                <Button variant="danger" onClick={() => setConfirmClear(true)}><Trash2 size={14} /> Clear history</Button>
              </div>
            </SettingsCard>
            <SettingsCard>
              <GroupHeading title="Legal & account" />
              <div className="flex flex-wrap gap-3 text-sm">
                <a className="text-primary hover:underline" href="mailto:cognitechsolutions.official@gmail.com?subject=Request%20for%20Faython%20privacy%20policy">Request privacy policy</a>
                <a className="text-primary hover:underline" href="mailto:cognitechsolutions.official@gmail.com?subject=Request%20for%20Faython%20terms%20of%20service">Request terms of service</a>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                <div><p className="text-sm font-medium text-foreground">Delete account</p><p className="text-xs text-muted">Account deletion must be handled by the identity provider.</p></div>
                <ComingSoon />
              </div>
            </SettingsCard>
          </div>
        );
      case "apps":
        return (
          <SettingsCard>
            <GroupHeading title="Connected apps" description="Connect academic tools to your Faython workflow." />
            {["Google Drive", "Google Docs"].map((app) => (
              <div key={app} className="flex items-center justify-between gap-3 border-b border-border py-4 last:border-0">
                <div className="flex items-center gap-3"><Globe size={17} className="text-primary" /><div><p className="text-sm font-medium text-foreground">{app}</p><p className="text-xs text-muted">Import and work with research materials.</p></div></div>
                <ComingSoon />
              </div>
            ))}
            <p className="mt-3 text-xs text-muted">No third-party app access is currently enabled.</p>
          </SettingsCard>
        );
      case "help":
        return (
          <div className="grid gap-4">
            <SettingsCard>
              <GroupHeading title="Help & support" description="Get assistance or share feedback with the Faython team." />
              <div className="grid gap-3 sm:grid-cols-2">
                <HelpLink title="Help centre" detail="Guides and common questions" href="mailto:cognitechsolutions.official@gmail.com?subject=Faython%20help%20centre" />
                <HelpLink title="FAQs" detail="Ask us about using Faython" href="mailto:cognitechsolutions.official@gmail.com?subject=Faython%20FAQ" />
                <HelpLink title="Contact support" detail="cognitechsolutions.official@gmail.com" href="mailto:cognitechsolutions.official@gmail.com" />
                <HelpLink title="Report a problem" detail="Tell us what went wrong" href="mailto:cognitechsolutions.official@gmail.com?subject=Faython%20bug%20report" />
                <HelpLink title="Request a feature" detail="Suggest an improvement" href="mailto:cognitechsolutions.official@gmail.com?subject=Faython%20feature%20request" />
              </div>
            </SettingsCard>
            <SettingsCard>
              <GroupHeading title="About Faython" />
              <p className="text-sm text-foreground">Faython Scholar</p>
              <p className="mt-1 text-xs text-muted">AI-powered academic research workspace · Preview build</p>
              <p className="mt-3 text-xs leading-relaxed text-muted">AI-generated content should be reviewed. Verify academic claims and sources before use.</p>
            </SettingsCard>
          </div>
        );
    }
  })();

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Preferences</p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.025em] text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted">Manage your Faython account and experience.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:border-r lg:border-border lg:pb-0 lg:pr-4">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                aria-current={section === id ? "page" : undefined}
                className={cx(
                  "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors lg:w-full",
                  section === id ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface hover:text-foreground",
                )}
              >
                <Icon size={16} />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            ))}
          </nav>

          <section className="min-w-0">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{copy.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{copy.description}</p>
              </div>
              {(section === "general" || section === "personalization" || section === "notifications") && (
                <Button size="sm" onClick={saveSettings}><Check size={14} /> Save changes</Button>
              )}
            </div>
            {content}
            {loading && <p className="mt-4 text-xs text-muted">Loading account details…</p>}
          </section>
        </div>
      </div>
      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={clearChatHistory}
        title="Clear chat history?"
        description="This removes messages from all conversations. Projects, chapters and saved documents will remain. This action cannot be undone."
        confirmLabel="Clear history"
        danger
      />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function usageTotal(ledger: ReturnType<typeof getTokenAccount>["ledger"], kind?: "topics" | "chapter" | "ask"): number {
  return ledger
    .filter((entry) => entry.type === "usage" && (!kind || entry.kind === kind))
    .reduce((total, entry) => total + Math.abs(entry.amount), 0);
}

function HelpLink({ title, detail, href }: { title: string; detail: string; href: string }) {
  return (
    <a href={href} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary-border hover:bg-primary-soft/30">
      <span><span className="block text-sm font-medium text-foreground">{title}</span><span className="mt-0.5 block text-xs text-muted">{detail}</span></span>
      <ChevronRight size={15} className="shrink-0 text-muted-foreground" />
    </a>
  );
}
