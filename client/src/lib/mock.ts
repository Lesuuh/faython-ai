import type {
  Chapter,
  ChapterResult,
  ChatResult,
  DailyUsage,
  InitiatePaymentResult,
  Message,
  Payment,
  Topic,
  TopicDetail,
  TopicsMeta,
  TopicsResponse,
} from "./types";

/**
 * Sample data used in preview/demo mode (no Supabase configured yet).
 * Lets the whole frontend be tested against realistic content.
 */

const NOW = new Date().toISOString();
const DAY_AGO = new Date(Date.now() - 86400000).toISOString();

export const SAMPLE_TOPIC_REPLY = [
  "Design and Fabrication of a Solar-Powered Water Pumping System for Rural Irrigation",
  "Performance Evaluation of a Locally Fabricated Briquetting Machine Using Agricultural Waste",
  "Structural Analysis and Design of a Reinforced Concrete Multi-Storey Building Using ETABS",
  "Development of an Automated Generator Changeover System Using Microcontroller Technology",
  "Effect of Waste Plastic as Partial Replacement of Bitumen in Flexible Pavement Construction",
  "Design and Simulation of a Low-Cost CNC Router for Small-Scale Manufacturing",
  "Failure Analysis of Mechanical Components in a 4.5kVA Portable Generator: A Case Study",
  "Design and Construction of an IoT-Based Real-Time Water Quality Monitoring System",
  "Optimization of Heat Exchanger Performance in a Small-Scale Refrigeration System",
  "Assessment of Renewable Energy Integration for Power Supply in Off-Grid Communities in Rivers State",
].join("\n");

function paragraph(text: string): string {
  return text;
}

function sampleChapterText(num: number): string {
  const intro: Record<number, string[]> = {
    1: [
      paragraph(
        `${num}.1 Background to the Study\n\nNigeria's transition to a cashless economy has accelerated the adoption of electronic payment systems across the country. For small and medium enterprises (SMEs) in Port Harcourt, this shift has reshaped how daily transactions are collected, recorded and reconciled. Although e-payment channels such as POS terminals, mobile money and internet banking promise greater convenience, their measurable effect on the performance of small businesses remains an under-examined question (Adeyemi & Okafor, 2022).`,
      ),
      paragraph(
        `${num}.2 Statement of the Problem\n\nThe growth rate of SMEs in Port Harcourt has not matched the level of investment in payment infrastructure within the state. Several factors — including high transaction charges, network failure and low financial literacy — have been blamed for this gap. Yet few studies have isolated the specific contribution of e-payment adoption to sales growth and cost reduction among these firms (Chukwuma, 2021). This study therefore investigates the extent to which e-payment systems influence small business performance in the study area.`,
      ),
      paragraph(
        `${num}.3 Aim and Objectives\n\nThis research aims to evaluate the impact of electronic payment systems on the performance of small businesses in Port Harcourt. The specific objectives are to:\n\n(i) examine the level of e-payment adoption among small businesses in Port Harcourt;\n(ii) determine the relationship between e-payment usage and sales growth;\n(iii) assess the effect of e-payment adoption on operational costs; and\n(iv) identify the challenges associated with e-payment usage among small businesses in the state.`,
      ),
      paragraph(
        `${num}.4 Research Questions\n\n1. What is the level of e-payment adoption among small businesses in Port Harcourt?\n2. How does e-payment usage relate to sales growth of small businesses?\n3. What effect does e-payment adoption have on the operational costs of small businesses?\n4. What challenges do small businesses face in using electronic payment systems?`,
      ),
      paragraph(
        `${num}.5 Significance of the Study\n\nThe findings will assist SME owners in making better decisions about payment infrastructure, guide policymakers in the design of small-business support programmes, and provide a foundation for future research on digital financial inclusion in the Niger Delta region.`,
      ),
      paragraph(
        `${num}.6 Scope of the Study\n\nThe study focuses on registered small businesses operating within Port Harcourt metropolis, Rivers State, with data collected between January and March, 2026.`,
      ),
    ],
    2: [
      paragraph(
        `${num}.1 Conceptual Review\n\nElectronic payment systems refer to the range of digital instruments used to transfer value in exchange for goods and services. Key concepts include point-of-sale (POS) transactions, mobile money, internet banking and card payments. Small business performance, on the other hand, is commonly measured through sales growth, profitability, customer reach and operational efficiency (World Bank, 2020).`,
      ),
      paragraph(
        `${num}.2 Theoretical Framework\n\nThis study is anchored on the Technology Acceptance Model (TAM), which posits that perceived usefulness and perceived ease of use determine the adoption of new technology (Davis, 1989). TAM provides a useful lens for explaining why some small businesses embrace e-payment channels while others continue with cash-based operations.`,
      ),
      paragraph(
        `${num}.3 Empirical Review\n\nStudies in Lagos reported a positive association between e-payment adoption and SME revenue (Ekong & Bassey, 2021). Conversely, research among traders in Onitsha found that transaction charges and network interruptions significantly moderate the benefits of e-payment usage (Nnamdi, 2019). These conflicting findings justify a context-specific study in Rivers State.`,
      ),
      paragraph(
        `${num}.4 Gap in Literature\n\nMost existing Nigerian studies concentrate on the banking sector or on large enterprises. Evidence focusing specifically on small businesses in Port Harcourt is scarce, especially studies linking e-payment adoption to both sales growth and cost reduction in a single model.`,
      ),
    ],
    3: [
      paragraph(
        `${num}.1 Research Design\n\nThis study adopts a descriptive survey design. This design is appropriate because it allows the researcher to describe the relationship between e-payment adoption and business performance using data collected from a defined population.`,
      ),
      paragraph(
        `${num}.2 Population and Sample\n\nThe target population consists of 1,240 registered small businesses in Port Harcourt metropolis. Using the Yamane formula at a 5% margin of error, a sample size of 302 businesses was obtained and selected through proportionate stratified random sampling.`,
      ),
      paragraph(
        `${num}.3 Instrumentation\n\nData were collected using a structured questionnaire with items rated on a five-point Likert scale. The instrument was validated by three experts and tested for reliability using Cronbach's alpha, which returned a coefficient of 0.86.`,
      ),
      paragraph(
        `${num}.4 Data Analysis Technique\n\nCollected data were analysed using descriptive statistics (frequencies, percentages, means) and inferential statistics (Pearson correlation and regression analysis) at a 0.05 level of significance.`,
      ),
    ],
    4: [
      paragraph(
        `${num}.1 Presentation of Results\n\nA total of 302 questionnaires were administered, of which 278 were returned and found usable, representing a response rate of 92.1%. The correlation analysis revealed a moderate positive relationship between e-payment adoption and sales growth (r = 0.48, p < 0.05).`,
      ),
      paragraph(
        `${num}.2 Discussion of Findings\n\nThe positive relationship between e-payment adoption and sales growth aligns with the findings of Ekong and Bassey (2021). However, the regression results indicated that network failures and transaction charges dampen the size of this effect, supporting the position earlier reported by Nnamdi (2019). These results suggest that infrastructure quality is as important as adoption itself.`,
      ),
    ],
    5: [
      paragraph(
        `${num}.1 Summary\n\nThis study examined the impact of electronic payment systems on the performance of small businesses in Port Harcourt. The findings show that e-payment adoption significantly relates to sales growth and modestly reduces operational costs.`,
      ),
      paragraph(
        `${num}.2 Conclusion\n\nE-payment systems contribute positively to small business performance, but their full benefit is limited by infrastructure and cost-related challenges.`,
      ),
      paragraph(
        `${num}.3 Recommendations\n\nBased on the findings, this study recommends that: (i) banks reduce transaction charges for small businesses; (ii) regulators strengthen network reliability in the Niger Delta; and (iii) SME operators combine e-payment channels with cash management controls to minimise risk.`,
      ),
    ],
  };

  return (intro[num] || []).join("\n\n");
}

export const MOCK_CHAPTERS: Record<number, string> = {
  1: sampleChapterText(1),
  2: sampleChapterText(2),
  3: sampleChapterText(3),
  4: sampleChapterText(4),
  5: sampleChapterText(5),
};

function mockTopicOne(): Topic {
  return {
    id: "demo-topic-1",
    userId: "demo-user-0001",
    prompt:
      "Impact of E-Payment Systems on Small Business Performance in Port Harcourt, Rivers State.",
    inputType: "TEXT",
    level: "Undergraduate",
    discipline: "Business Administration",
    reply: SAMPLE_TOPIC_REPLY,
    saved: true,
    createdAt: DAY_AGO,
  };
}

function mockTopicTwo(): Topic {
  return {
    id: "demo-topic-2",
    userId: "demo-user-0001",
    prompt:
      "Effect of Social Media Marketing on Consumer Purchase Decisions among Young Adults in Nigeria.",
    inputType: "TEXT",
    level: "Undergraduate",
    discipline: "Mass Communication",
    reply: SAMPLE_TOPIC_REPLY,
    saved: false,
    createdAt: NOW,
  };
}

export const MOCK_TOPICS = [mockTopicOne(), mockTopicTwo()];

export function mockTopicDetail(id: string): TopicDetail {
  if (id === "demo-topic-2") {
    return {
      topic: {
        ...mockTopicTwo(),
        chapters: [
          {
            id: "demo-ch-2-1",
            topicId: id,
            chapterNumber: 1,
            content: MOCK_CHAPTERS[1],
            generatedAt: DAY_AGO,
          },
        ],
        entitlement: null,
      },
    };
  }
  return {
    topic: {
      ...mockTopicOne(),
      chapters: Object.keys(MOCK_CHAPTERS).map((n) => {
        const num = Number(n);
        return {
          id: `demo-ch-1-${num}`,
          topicId: "demo-topic-1",
          chapterNumber: num,
          content: MOCK_CHAPTERS[num],
          generatedAt: new Date(Date.now() - num * 172800000).toISOString(),
        } satisfies Chapter;
      }),
      entitlement: { unlockedChapters: 5 },
    },
  };
}

export function mockChatResult(): ChatResult {
  return {
    topicId: "demo-topic-1",
    reply: SAMPLE_TOPIC_REPLY,
    inputType: "TEXT",
    createdAt: NOW,
    usage: { topics: 2, chapterOne: 0 },
  };
}

export function mockTopics(params: {
  page?: number;
  limit?: number;
}): TopicsResponse {
  return {
    items: MOCK_TOPICS.map((t) => ({
      ...t,
      chapterCount: t.id === "demo-topic-1" ? 5 : 1,
    })),
    total: MOCK_TOPICS.length,
    page: params.page || 1,
    limit: params.limit || 20,
    totalPages: 1,
  };
}

export function mockTopicsMeta(): TopicsMeta {
  return {
    levels: ["Undergraduate"],
    disciplines: ["Business Administration", "Mass Communication"],
    counts: { all: 2, saved: 1 },
  };
}

export function mockMessages(topicId: string): { messages: Message[] } {
  if (topicId !== "demo-topic-2") {
    return {
      messages: [
        {
          id: "m1",
          topicId,
          role: "USER",
          content:
            "Please make the problem statement more specific to small businesses in Port Harcourt, and shorten the background slightly.",
          createdAt: DAY_AGO,
        },
        {
          id: "m2",
          topicId,
          role: "AI",
          content:
            "Done. The problem statement now anchors on the mismatch between payment infrastructure investment and SME growth in Port Harcourt, and the background has been trimmed to two focused paragraphs. Let me know if you'd like the objectives reordered.",
          createdAt: DAY_AGO,
        },
      ],
    };
  }
  return {
    messages: [
      {
        id: "m1",
        topicId,
        role: "USER",
        content: "Suggest a topic within this area and explain its scope.",
        createdAt: NOW,
      },
    ],
  };
}

export function mockUsage(): { usage: DailyUsage } {
  return { usage: { topics: 2, chapterOne: 1 } };
}

export function mockChapterResult(
  topicId: string,
  chapterNumber: number,
): ChapterResult {
  return {
    cached: false,
    chapter: {
      id: `demo-ch-${chapterNumber}`,
      topicId,
      chapterNumber,
      content: MOCK_CHAPTERS[chapterNumber] || MOCK_CHAPTERS[1],
      generatedAt: NOW,
    },
  };
}

export function mockPayments(): { payments: Payment[] } {
  return {
    payments: [
      {
        id: "pay-1",
        topicId: "demo-topic-1",
        reference: "demo-ref-0001",
        amount: 50000,
        currency: "NGN",
        status: "SUCCESS",
        paidAt: DAY_AGO,
        createdAt: DAY_AGO,
        topic: { id: "demo-topic-1", prompt: mockTopicOne().prompt },
      },
    ],
  };
}

export function mockInitiatePayment(_topicId: string): InitiatePaymentResult {
  return {
    authorizationUrl: "#demo-paystack",
    reference: `demo-ref-${Date.now()}`,
    accessCode: "demo-access",
  };
}

async function later<T>(value: T, ms = 500): Promise<T> {
  await new Promise((r) => setTimeout(r, ms));
  return value;
}

export const mock = {
  usage: () => later<{ usage: DailyUsage }>(mockUsage(), 250),
  generateTopics: () => later<string>(SAMPLE_TOPIC_REPLY, 900),
  generateChapter: (chapterNumber: number) =>
    later<string>(MOCK_CHAPTERS[chapterNumber] || MOCK_CHAPTERS[1], 1200),
  askProject: (question: string) =>
    later<string>(
      `**On "${question.trim()}"**\n\nBased on the scope you captured for this project, I'd keep the population tight and the variables measurable. Two options:\n\n1. **Narrow study** — one campus, one department, one semester of data. Fastest to collect, easiest to defend in Chapter Three.\n2. **Wider study** — three departments across the institution. Stronger generalisability, but you'll need a larger sample and a longer instrument.\n\nFor an undergraduate project, go with the first. Say the word and I'll fold the choice into the next chapter.`,
      800,
    ),
  topics: (params: { page?: number; limit?: number }) =>
    later<TopicsResponse>(mockTopics(params), 400),
  topicsMeta: () => later<TopicsMeta>(mockTopicsMeta(), 300),
  topicDetail: (id: string) => later<TopicDetail>(mockTopicDetail(id), 400),
  topicMessages: (id: string) =>
    later<{ messages: Message[] }>(mockMessages(id), 300),
  setSaved: (id: string, saved: boolean) => {
    const t = MOCK_TOPICS.find((x) => x.id === id) || mockTopicOne();
    return later<{ topic: Topic }>({ topic: { ...t, saved } }, 250);
  },
  deleteTopic: () => later<{ ok: boolean }>({ ok: true }, 250),
  clearTopics: () => later<{ ok: boolean }>({ ok: true }, 250),
  generateChapterOne: (topicId: string) =>
    later<ChapterResult>(mockChapterResult(topicId, 1), 1200),
  initiatePayment: (topicId: string) =>
    later<InitiatePaymentResult>(mockInitiatePayment(topicId), 400),
  verifyPayment: (_reference: string) =>
    later(
      {
        status: "success",
        payment: mockPayments().payments[0],
        entitlement: { unlockedChapters: 5 },
      },
      400,
    ),
  paymentHistory: () => later<{ payments: Payment[] }>(mockPayments(), 300),
};
