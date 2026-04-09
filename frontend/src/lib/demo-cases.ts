import type { DemoCase } from "./types";

export const demoCases: DemoCase[] = [
  {
    id: "grounded_inject",
    name: "Grounded Inject",
    group: "Inject",
    input: {
      query: "How do I reset my membership password?",
      llm_answer:
        "Go to the member portal and click Forgot Password. You will receive an email.",
      grounding: { is_grounded: true, kb_grounded: true },
      is_chitchat: false,
      candidate_links: [
        {
          label: "Member Portal",
          url: "https://example.com/members",
          keywords: ["membership", "password", "login"],
          description: "Member account management",
        },
        {
          label: "Listings Help",
          url: "https://example.com/listings",
          keywords: ["listing", "property"],
          description: "Listings help",
        },
      ],
    },
    expected: { status: "injected", matched_label: "Member Portal" },
  },
  {
    id: "already_present",
    name: "Already Present",
    group: "Detect Existing",
    input: {
      query: "Where can I find the member portal?",
      llm_answer:
        "You can find it at [Member Portal](https://example.com/members).",
      grounding: { is_grounded: true, kb_grounded: true },
      is_chitchat: false,
      candidate_links: [
        {
          label: "Member Portal",
          url: "https://example.com/members",
          keywords: ["membership", "portal"],
          description: "Member account management",
        },
      ],
    },
    expected: { status: "already_present", matched_label: "Member Portal" },
  },
  {
    id: "chitchat_skip",
    name: "Chitchat Skip",
    group: "Skip Rules",
    input: {
      query: "hello, how are you?",
      llm_answer:
        "Hi! I'm doing well, thanks for asking. How can I help you today?",
      grounding: { is_grounded: true, kb_grounded: false },
      is_chitchat: true,
      candidate_links: [
        {
          label: "Member Portal",
          url: "https://example.com/members",
          keywords: ["membership", "portal"],
          description: "Member account management",
        },
      ],
    },
    expected: { status: "skipped_chitchat", matched_label: null },
  },
  {
    id: "ungrounded_skip",
    name: "Ungrounded Skip",
    group: "Skip Rules",
    input: {
      query: "What's the weather in Tokyo?",
      llm_answer: "I haven't been trained on that one yet.",
      grounding: { is_grounded: false, kb_grounded: false },
      is_chitchat: false,
      candidate_links: [
        {
          label: "Member Portal",
          url: "https://example.com/members",
          keywords: ["membership"],
          description: "Member portal",
        },
      ],
    },
    expected: { status: "skipped_ungrounded", matched_label: null },
  },
  {
    id: "no_match",
    name: "No Match",
    group: "Edge Cases",
    input: {
      query: "What time does the pool open?",
      llm_answer: "The pool opens at 7am every day.",
      grounding: { is_grounded: true, kb_grounded: true },
      is_chitchat: false,
      candidate_links: [
        {
          label: "Member Portal",
          url: "https://example.com/members",
          keywords: ["membership", "portal"],
          description: "Member account management",
        },
      ],
    },
    expected: { status: "skipped_no_match", matched_label: null },
  },
  {
    id: "empty_candidates",
    name: "Empty Candidates",
    group: "Edge Cases",
    input: {
      query: "How do I contact support?",
      llm_answer:
        "You can reach our support team via the contact form on our website.",
      grounding: { is_grounded: true, kb_grounded: true },
      is_chitchat: false,
      candidate_links: [],
    },
    expected: { status: "skipped_no_match", matched_label: null },
  },
];

export const demoCaseGroups = [
  "Inject",
  "Detect Existing",
  "Skip Rules",
  "Edge Cases",
] as const;
