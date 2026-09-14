export type PlanId = "free" | "pro" | "research";

export type Plan = {
  id: PlanId;
  name: string;
  priceMonthly: number;
  tokensPerMonth: number;
  features: string[];
  highlight?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    tokensPerMonth: 3_000,
    features: [
      "Generate topics & save conversations",
      "Export conversations and projects",
      "3,000 tokens refreshed monthly",
    ],
  },
  {
    id: "pro",
    name: "Student Pro",
    priceMonthly: 9,
    tokensPerMonth: 50_000,
    highlight: true,
    features: [
      "Everything in Free",
      "50,000 tokens refreshed monthly",
      "Priority generation queue",
      "Preview of new research features",
    ],
  },
  {
    id: "research",
    name: "Researcher",
    priceMonthly: 18,
    tokensPerMonth: 200_000,
    features: [
      "Everything in Student Pro",
      "200,000 tokens refreshed monthly",
      "Project exports & sharing (coming soon)",
      "Dedicated support",
    ],
  },
];

export const TOKEN_COSTS = {
  topics: 300,
  chapter: 1_200,
} as const;

export function planById(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export type TopUpPack = {
  id: string;
  tokens: number;
  price: number;
};

export const TOP_UP_PACKS: TopUpPack[] = [
  { id: "topup-small", tokens: 5_000, price: 3 },
  { id: "topup-medium", tokens: 20_000, price: 9 },
  { id: "topup-large", tokens: 100_000, price: 35 },
];