import type { VerifyResult } from "./types";

export const mockAgreementResult: VerifyResult = {
  question: "Am I eligible for the AICTE Pragati Scholarship?",
  findings: [
    {
      agentName: "Vera",
      sourceTier: "official",
      answer: "Eligible if girl student in first year of Degree/Diploma in AICTE approved institution.",
      sourceUrl: "aicte-india.org",
      recency: "2024-10-15"
    },
    {
      agentName: "Vox",
      sourceTier: "news",
      answer: "AICTE continues Pragati Scholarship for girl students entering first year.",
      sourceUrl: "timesofindia.indiatimes.com",
      recency: "2024-09-20"
    },
    {
      agentName: "Trace",
      sourceTier: "anecdotal",
      answer: "Yes, I got it last year as a first-year diploma student.",
      sourceUrl: "reddit.com/r/IndianAcademia",
      recency: "2024-10-01"
    }
  ],
  judgment: {
    agreementSummary: "All sources confirm eligibility for first-year female students in approved institutions.",
    confidenceScore: 95,
    breakdown: { baseScore: 80, consistencyBonus: 15 },
    selectedAnswer: "Eligible if girl student in first year of Degree/Diploma in AICTE approved institution.",
    needsHumanReview: false
  },
  finalAnswer: "Yes, you are eligible for the AICTE Pragati Scholarship if you are a girl student entering the first year of a Degree or Diploma program at an AICTE-approved institution.",
  trustExplanation: "Based on official sources — all tiers in agreement"
};

export const mockConflictResult: VerifyResult = {
  question: "Is the final exam deadline extended to next week?",
  findings: [
    {
      agentName: "Vera",
      sourceTier: "official",
      answer: "The exam deadline remains unchanged. It is this Friday.",
      sourceUrl: "university.edu/exams",
      recency: "2024-10-18"
    },
    {
      agentName: "Vox",
      sourceTier: "news",
      answer: "Student union claims exam deadline extended due to protests.",
      sourceUrl: "campusnews.com",
      recency: "2024-10-19"
    },
    {
      agentName: "Trace",
      sourceTier: "anecdotal",
      answer: "Everyone on WhatsApp is saying it's delayed to next week!",
      sourceUrl: "whatsapp/groups",
      recency: "2024-10-19"
    }
  ],
  judgment: {
    agreementSummary: "Official source contradicts unconfirmed claims — prioritizing verified source.",
    confidenceScore: 80,
    breakdown: { baseScore: 80, consistencyBonus: 0 },
    selectedAnswer: "The exam deadline remains unchanged. It is this Friday.",
    needsHumanReview: false
  },
  finalAnswer: "No, the exam deadline has NOT been extended. Official university sources confirm it remains scheduled for this Friday, despite rumors on social media.",
  trustExplanation: "Official source prioritised over contradicting anecdotal claims"
};
