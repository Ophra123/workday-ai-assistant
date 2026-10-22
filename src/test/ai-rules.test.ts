import { describe, expect, it } from "vitest";

import { emailSchema, researchSchema } from "@/lib/ai/schemas";

describe("email generator rules", () => {
  it("rejects empty or whitespace-only instructions", () => {
    expect(emailSchema.safeParse({ instructions: "   ", tone: "Formal" }).success).toBe(false);
  });

  it("accepts the Formal, Friendly and Persuasive tones only", () => {
    for (const tone of ["Formal", "Friendly", "Persuasive"]) {
      expect(emailSchema.safeParse({ instructions: "Hi", tone }).success).toBe(true);
    }
    expect(emailSchema.safeParse({ instructions: "Hi", tone: "Casual" }).success).toBe(false);
  });
});

describe("research assistant rules", () => {
  it("rejects empty input", () => {
    expect(researchSchema.safeParse({ mode: "summarise", input: "" }).success).toBe(false);
  });

  it("supports question, summarise, insights and recommendations", () => {
    for (const mode of ["question", "summarise", "insights", "recommendations"]) {
      expect(researchSchema.safeParse({ mode, input: "Topic" }).success).toBe(true);
    }
  });
});
