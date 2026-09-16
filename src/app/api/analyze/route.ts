import { NextRequest, NextResponse } from "next/server";
import { callBedrock } from "@/lib/bedrock";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are an expert resume strategist and ATS optimization specialist for software engineers.

Your job:
1. Extract the key requirements, skills, and ATS keywords from a job description
2. Select the best 3 experiences and 1 project from the candidate's bank
3. Score ATS keyword coverage across ALL selected content + skills section
4. Suggest MINIMAL surgical edits to bullets to close ATS gaps
5. Suggest a reordered/tweaked Technical Skills section to front-load JD-relevant skills

Rules:
- Each bullet is ~210 characters. Keep that length. Never rewrite from scratch.
- Only suggest small word swaps or phrase insertions to thread in missing keywords.
- Items appearing in BOTH experience and project lists are the same work — include once only (prefer experience, use as project only if not selected as experience).
- The candidate's LaTeX template uses \\textbf{} for bold. Keep that syntax.
- Be specific about WHY each experience/project was selected.
- For the Technical Skills section: you CAN reorder categories, add missing JD-relevant skills, and remove less relevant ones. Keep the same category format (Languages, AI & Robotics, Full-Stack, Cloud & DevOps, Hardware) but reorder and adjust contents.
- For atsKeywords: extract SPECIFIC technical terms (languages, frameworks, tools, methodologies) — not generic words like "design", "system", "software".
- Coverage score should reflect what percentage of YOUR extracted atsKeywords appear in the selected experiences + project + skills combined.
- When computing coverage AFTER edits, assume all suggested edits are accepted.

Respond in JSON only. No markdown wrapping, no explanation outside the JSON.`;

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
    const { jd, experiences, projects, skillsTex } = (await request.json()) as {
      jd: string;
      experiences: BankEntry[];
      projects: BankEntry[];
      skillsTex: string;
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

## Current Technical Skills Section (LaTeX)
${skillsTex}

## Task
Analyze this JD and respond with this exact JSON schema:
{
  "jdAnalysis": {
    "role": "short role title",
    "company": "company name",
    "keyRequirements": ["list of 5-8 most important requirements"],
    "atsKeywords": ["15-25 SPECIFIC technical keywords/tools/languages from the JD"],
    "niceToHaves": ["optional/preferred qualifications"]
  },
  "selection": {
    "experiences": [
      {
        "index": 0,
        "title": "Company Name",
        "reason": "1-2 sentence reason this matches"
      }
    ],
    "project": {
      "index": 0,
      "title": "Project Name",
      "reason": "1-2 sentence reason, confirming no duplicate with selected experiences"
    }
  },
  "coverage": {
    "score": 78,
    "covered": ["keywords found in selected content + skills"],
    "missing": ["keywords NOT found anywhere in selected content + skills"],
    "scoreAfterEdits": 92,
    "coveredAfterEdits": ["keywords that would be covered if all edits accepted"]
  },
  "suggestedEdits": [
    {
      "entryTitle": "Company Name",
      "bulletIndex": 2,
      "original": "the exact original bullet text",
      "edited": "the bullet with minimal keyword insertion",
      "reason": "Threads in 'keyword X' to close ATS gap"
    }
  ],
  "suggestedSkills": "The full rewritten Technical Skills LaTeX section with JD-relevant skills front-loaded and any missing JD skills added. Keep the \\\\textbf{Category}{: items} format. This is raw LaTeX."
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
