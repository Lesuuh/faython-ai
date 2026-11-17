const seededProjects = [
  {
    id: "proj-social-media",
    title: "Social Media and Academic Performance among Undergraduate Students",
    description:
      "A study that examines how social media use influences study habits, engagement, and academic outcomes among undergraduates.",
    researchTopic: "The influence of social media on academic performance",
    institution: "University of Port Harcourt",
    department: "Department of Psychology",
    course: "BSc Psychology",
    academicLevel: "undergraduate",
    academicSession: "2024/2025",
    referencingStyle: "APA 7th edition",
    supervisor: "Dr. C. A. Okafor",
    status: "active",
    createdAt: "2024-10-11T09:00:00.000Z",
    updatedAt: "2025-02-18T11:24:00.000Z",
    instructions: [
      {
        id: "instr-social-1",
        text: "Use British English. Maintain a formal academic tone and justify claims with evidence from credible literature.",
        updatedAt: "2025-02-18T11:24:00.000Z",
      },
    ],
    files: [
      {
        id: "file-social-1",
        name: "student-questionnaire.pdf",
        type: "PDF",
        size: "1.4 MB",
        uploadedAt: "2025-02-10T10:20:00.000Z",
        isDummy: true,
      },
      {
        id: "file-social-2",
        name: "survey-dataset.csv",
        type: "CSV",
        size: "842 KB",
        uploadedAt: "2025-02-12T11:45:00.000Z",
        isDummy: true,
      },
    ],
    documents: [
      {
        id: "doc-social-1",
        title: "Chapter One Draft",
        type: "chapter",
        content:
          "This chapter introduces the problem, background, and significance of the study. It situates social media use among undergraduate students in relation to academic performance.",
        status: "draft",
        createdAt: "2025-02-15T09:00:00.000Z",
        updatedAt: "2025-02-18T10:30:00.000Z",
        wordCount: 1428,
        sourceConversationId: "conv-social-1",
        sourceChapterNumber: 1,
      },
      {
        id: "doc-social-2",
        title: "Research Proposal",
        type: "proposal",
        content:
          "Proposal covering the problem statement, objectives, hypotheses, and scope of the study.",
        status: "saved",
        createdAt: "2025-02-16T08:30:00.000Z",
        updatedAt: "2025-02-18T11:00:00.000Z",
        wordCount: 2320,
      },
    ],
    activity: [
      {
        id: "act-social-1",
        type: "project_created",
        message: "Project created",
        createdAt: "2024-10-11T09:00:00.000Z",
      },
      {
        id: "act-social-2",
        type: "conversation_started",
        message: "Started a new conversation: Topic narrowing",
        createdAt: "2025-02-15T09:12:00.000Z",
      },
      {
        id: "act-social-3",
        type: "chapter_saved",
        message: "Saved Chapter One draft",
        createdAt: "2025-02-18T10:30:00.000Z",
      },
    ],
    conversations: [
      {
        id: "conv-social-1",
        title: "Topic narrowing",
        createdAt: "2025-02-15T09:12:00.000Z",
        updatedAt: "2025-02-18T10:15:00.000Z",
        messages: [
          {
            id: "msg-social-u1",
            role: "user",
            kind: "question",
            content: "Help me refine this topic and suggest the key academic angles to explore.",
            createdAt: "2025-02-15T09:12:00.000Z",
          },
          {
            id: "msg-social-a1",
            role: "assistant",
            kind: "answer",
            content:
              "You can frame the study around social media addiction, usage patterns, and academic engagement. A strong research angle is to explore whether excessive social media use predicts lower CGPA and higher procrastination among undergraduates.",
            createdAt: "2025-02-15T09:13:00.000Z",
          },
        ],
      },
      {
        id: "conv-social-2",
        title: "Chapter one review",
        createdAt: "2025-02-17T13:40:00.000Z",
        updatedAt: "2025-02-18T11:24:00.000Z",
        messages: [
          {
            id: "msg-social-u2",
            role: "user",
            kind: "question",
            content: "Review Chapter One and suggest a sharper problem statement and research objectives.",
            createdAt: "2025-02-17T13:40:00.000Z",
          },
          {
            id: "msg-social-a2",
            role: "assistant",
            kind: "answer",
            content:
              "A stronger problem statement would focus on the relationship between time spent on social media platforms and students' academic performance, particularly in relation to study concentration and assignment completion.",
            createdAt: "2025-02-17T13:42:00.000Z",
          },
        ],
      },
    ],
    activeConversationId: "conv-social-1",
    suggestions: [
      { id: "sugg-social-1", title: "Social Media Usage and Academic Performance among Undergraduates", rationale: "Clear and measurable scope for a student research project." },
      { id: "sugg-social-2", title: "The Influence of Social Media Addiction on Students' Study Habits", rationale: "Useful for investigating behavioural and academic determinants." },
    ],
    chapters: [
      { number: 1, title: "Introduction", content: "", state: "done", instruction: "Write introduction", updatedAt: "2025-02-18T10:30:00.000Z" },
      { number: 2, title: "Literature Review", content: "", state: "idle", instruction: "", updatedAt: null },
      { number: 3, title: "Methodology", content: "", state: "idle", instruction: "", updatedAt: null },
      { number: 4, title: "Results and Discussion", content: "", state: "idle", instruction: "", updatedAt: null },
      { number: 5, title: "Conclusion and Recommendations", content: "", state: "idle", instruction: "", updatedAt: null },
    ],
    messages: [
      {
        id: "msg-social-u1",
        role: "user",
        kind: "question",
        content: "Help me refine this topic and suggest the key academic angles to explore.",
        createdAt: "2025-02-15T09:12:00.000Z",
      },
      {
        id: "msg-social-a1",
        role: "assistant",
        kind: "answer",
        content:
          "You can frame the study around social media addiction, usage patterns, and academic engagement. A strong research angle is to explore whether excessive social media use predicts lower CGPA and higher procrastination among undergraduates.",
        createdAt: "2025-02-15T09:13:00.000Z",
      },
    ],
  },
  {
    id: "proj-renewable-energy",
    title: "Adoption of Renewable Energy in Residential Buildings",
    description:
      "A project examining residential adoption barriers, motivations, and the role of awareness in renewable energy uptake.",
    researchTopic: "Renewable energy adoption in residential buildings",
    institution: "Federal University of Technology",
    department: "Department of Architecture",
    course: "BSc Architecture",
    academicLevel: "undergraduate",
    academicSession: "2023/2024",
    referencingStyle: "Harvard style",
    supervisor: "Prof. J. O. Stephen",
    status: "active",
    createdAt: "2024-08-18T08:30:00.000Z",
    updatedAt: "2025-01-04T12:15:00.000Z",
    instructions: [
      {
        id: "instr-energy-1",
        text: "Keep the writing focused on practical adoption, cost barriers, and policy implications. Avoid unsupported claims about energy savings.",
        updatedAt: "2025-01-04T12:15:00.000Z",
      },
    ],
    files: [
      {
        id: "file-energy-1",
        name: "housing-survey.docx",
        type: "DOCX",
        size: "2.2 MB",
        uploadedAt: "2025-01-02T09:55:00.000Z",
        isDummy: true,
      },
    ],
    documents: [
      {
        id: "doc-energy-1",
        title: "Abstract",
        type: "abstract",
        content: "The study evaluates the drivers and barriers of renewable energy adoption in residential buildings.",
        status: "saved",
        createdAt: "2025-01-03T12:00:00.000Z",
        updatedAt: "2025-01-04T12:15:00.000Z",
        wordCount: 430,
      },
    ],
    activity: [
      {
        id: "act-energy-1",
        type: "file_added",
        message: "Uploaded housing survey document",
        createdAt: "2025-01-02T09:55:00.000Z",
      },
      {
        id: "act-energy-2",
        type: "instructions_updated",
        message: "Updated project instructions",
        createdAt: "2025-01-04T12:15:00.000Z",
      },
    ],
    conversations: [
      {
        id: "conv-energy-1",
        title: "Research objectives",
        createdAt: "2024-12-02T16:12:00.000Z",
        updatedAt: "2025-01-04T12:15:00.000Z",
        messages: [
          {
            id: "msg-energy-u1",
            role: "user",
            kind: "question",
            content: "Help me develop a clear set of objectives and questions for this project.",
            createdAt: "2024-12-02T16:12:00.000Z",
          },
          {
            id: "msg-energy-a1",
            role: "assistant",
            kind: "answer",
            content:
              "You could set objectives around awareness, cost influence, government incentives, and perceived convenience. The key is to connect adoption behaviour to contextual factors in residential settings.",
            createdAt: "2024-12-02T16:14:00.000Z",
          },
        ],
      },
    ],
    activeConversationId: "conv-energy-1",
    suggestions: [
      { id: "sugg-energy-1", title: "Barriers to Renewable Energy Adoption in Residential Housing", rationale: "Strong practical narrative with policy relevance." },
    ],
    chapters: [
      { number: 1, title: "Introduction", content: "", state: "idle", instruction: "", updatedAt: null },
      { number: 2, title: "Literature Review", content: "", state: "idle", instruction: "", updatedAt: null },
      { number: 3, title: "Methodology", content: "", state: "idle", instruction: "", updatedAt: null },
      { number: 4, title: "Findings and Discussion", content: "", state: "idle", instruction: "", updatedAt: null },
      { number: 5, title: "Conclusion and Recommendations", content: "", state: "idle", instruction: "", updatedAt: null },
    ],
    messages: [
      {
        id: "msg-energy-u1",
        role: "user",
        kind: "question",
        content: "Help me develop a clear set of objectives and questions for this project.",
        createdAt: "2024-12-02T16:12:00.000Z",
      },
      {
        id: "msg-energy-a1",
        role: "assistant",
        kind: "answer",
        content:
          "You could set objectives around awareness, cost influence, government incentives, and perceived convenience. The key is to connect adoption behaviour to contextual factors in residential settings.",
        createdAt: "2024-12-02T16:14:00.000Z",
      },
    ],
  },
  {
    id: "proj-motivation-productivity",
    title: "The Impact of Employee Motivation on Organisational Productivity",
    description:
      "An organisational behaviour study evaluating motivation, commitment, and workplace performance in a service organisation.",
    researchTopic: "Employee motivation and organisational productivity",
    institution: "Niger Delta University",
    department: "Department of Business Administration",
    course: "BBA",
    academicLevel: "undergraduate",
    academicSession: "2022/2023",
    referencingStyle: "APA 7th edition",
    supervisor: "Dr. T. B. Kemele",
    status: "archived",
    createdAt: "2023-09-10T08:00:00.000Z",
    updatedAt: "2024-11-21T14:45:00.000Z",
    instructions: [
      {
        id: "instr-motivation-1",
        text: "Use an organisational behaviour lens and remain balanced between theoretical and practical implications.",
        updatedAt: "2024-11-21T14:45:00.000Z",
      },
    ],
    files: [
      {
        id: "file-motivation-1",
        name: "staff-feedback-form.pdf",
        type: "PDF",
        size: "1.1 MB",
        uploadedAt: "2024-11-19T09:22:00.000Z",
        isDummy: true,
      },
    ],
    documents: [
      {
        id: "doc-motivation-1",
        title: "Chapter Two Draft",
        type: "chapter",
        content: "This chapter reviews theoretical frameworks of motivation and their relationship to productivity and employee performance.",
        status: "draft",
        createdAt: "2024-11-20T10:00:00.000Z",
        updatedAt: "2024-11-21T14:45:00.000Z",
        wordCount: 1640,
        sourceChapterNumber: 2,
      },
    ],
    activity: [
      {
        id: "act-motivation-1",
        type: "project_created",
        message: "Project archived after final review",
        createdAt: "2024-11-21T14:45:00.000Z",
      },
    ],
    conversations: [
      {
        id: "conv-motivation-1",
        title: "Theoretical framework",
        createdAt: "2024-10-06T09:00:00.000Z",
        updatedAt: "2024-11-21T14:45:00.000Z",
        messages: [
          {
            id: "msg-motivation-u1",
            role: "user",
            kind: "question",
            content: "Help me decide which motivation theories should underpin this study.",
            createdAt: "2024-10-06T09:00:00.000Z",
          },
          {
            id: "msg-motivation-a1",
            role: "assistant",
            kind: "answer",
            content:
              "Maslow's hierarchy and Herzberg's two-factor theory are highly suitable if you want to connect intrinsic motivation, job satisfaction, and performance outcomes.",
            createdAt: "2024-10-06T09:02:00.000Z",
          },
        ],
      },
    ],
    activeConversationId: "conv-motivation-1",
    suggestions: [
      { id: "sugg-motivation-1", title: "Impact of Employee Motivation on Organisational Productivity", rationale: "A practical project with clear business relevance." },
    ],
    chapters: [
      { number: 1, title: "Introduction", content: "", state: "done", instruction: "", updatedAt: "2024-11-08T00:00:00.000Z" },
      { number: 2, title: "Literature Review", content: "", state: "done", instruction: "", updatedAt: "2024-11-21T14:45:00.000Z" },
      { number: 3, title: "Methodology", content: "", state: "idle", instruction: "", updatedAt: null },
      { number: 4, title: "Results and Discussion", content: "", state: "idle", instruction: "", updatedAt: null },
      { number: 5, title: "Conclusion", content: "", state: "idle", instruction: "", updatedAt: null },
    ],
    messages: [
      {
        id: "msg-motivation-u1",
        role: "user",
        kind: "question",
        content: "Help me decide which motivation theories should underpin this study.",
        createdAt: "2024-10-06T09:00:00.000Z",
      },
      {
        id: "msg-motivation-a1",
        role: "assistant",
        kind: "answer",
        content:
          "Maslow's hierarchy and Herzberg's two-factor theory are highly suitable if you want to connect intrinsic motivation, job satisfaction, and performance outcomes.",
        createdAt: "2024-10-06T09:02:00.000Z",
      },
    ],
  },
];

export default seededProjects;
