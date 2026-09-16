import { NextRequest, NextResponse } from "next/server";
import { callBedrock } from "@/lib/bedrock";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are an expert resume strategist and ATS optimization specialist. You help software engineers tailor their resumes for specific job descriptions.

Your job:
1. Extract the key requirements, skills, and keywords from a job description
2. Select the best 3 experiences and 1 project from a candidate's bank that match the JD
3. Score ATS keyword coverage
4. Suggest MINIMAL surgical edits to a few bullets to close ATS gaps — never rewrite, never larp, just thread in missing keywords naturally

Rules:
- Each bullet is ~210 characters. Keep that length.
- Never rewrite a bullet from scratch. Only suggest small word swaps or phrase insertions.
- Items that appear in BOTH experience and project lists are the same work — only include once (prefer as experience, use as project only if not selected as experience)
- The candidate's LaTeX template uses \\textbf{} for bold. Keep that syntax in edits.
- Be specific about WHY each experience/project was selected
- For missing keywords, only suggest edits when the keyword is genuinely important for the role

Respond in JSON only. No markdown, no explanation outside the JSON.`;

type BankEntry = {
  kind: string;
  title: string;
  subtitle?: string;
  dateRange?: string;
  location?: string;
  bullets: string[];
  tags: string[];
};

export async function POST(request: NextRequest) {
  try {
    const { jd, experiences, projects } = (await request.json()) as {
      jd: string;
      experiences: BankEntry[];
      projects: BankEntry[];
    };

    if (!jd || !experiences?.length) {
      return NextResponse.json({ error: "Missing JD or bank entries" }, { status: 400 });
    }

    const userMessage = `## Job Description
${jd}

## Available Experiences
${experiences.map((e, i) => `### Experience ${i + 1}: ${e.title} — ${e.subtitle}
Tags: ${e.tags.join(", ")}
Bullets:
${e.bullets.map((b, j) => `  ${j}. ${b}`).join("\n")}`).join("\n\n")}

## Available Projects
${projects.map((p, i) => `### Project ${i + 1}: ${p.title} — ${p.subtitle || ""}
Tags: ${p.tags.join(", ")}
Bullets:
${p.bullets.map((b, j) => `  ${j}. ${b}`).join("\n")}`).join("\n\n")}

## Task
Analyze this JD and respond with this exact JSON schema:
{
  "jdAnalysis": {
    "role": "short role title",
    "company": "company name",
    "keyRequirements": ["list of 5-8 most important requirements"],
    "atsKeywords": ["list of 15-25 specific technical keywords to match"],
    "niceToHaves": ["optional/preferred qualifications"]
  },
  "selection": {
    "experiences": [
      {
        "index": 0,
        "title": "Company Name",
        "reason": "Why this experience matches the JD"
      }
    ],
    "project": {
      "index": 0,
      "title": "Project Name",
      "reason": "Why this project matches and doesn't duplicate a selected experience"
    }
  },
  "coverage": {
    "score": 78,
    "covered": ["keywords found in selected content"],
    "missing": ["keywords NOT found in selected content"]
  },
  "suggestedEdits": [
    {
      "entryTitle": "Company Name",
      "bulletIndex": 2,
      "original": "the original bullet text",
      "edited": "the bullet with minimal keyword insertion",
      "reason": "Threads in 'keyword X' to close ATS gap"
    }
  ]
}`;

    const raw = await callBedrock(SYSTEM_PROMPT, userMessage);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse AI response", raw }, { status: 500 });
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return NextResponse.json(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
