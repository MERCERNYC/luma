import { NextResponse } from "next/server";
import type { LumaEmail } from "@/types/email";
import { analyzeEmailWithWatson } from "@/lib/watsonOrchestrate";
import { manualReviewAnalysis } from "@/lib/agentEmailAnalysis";
/**
 * DEVELOPMENT-ONLY API endpoint.
 * Do not enable publicly without user authentication, authorization,
 * rate limits, privacy controls, and explicit permission to process mail.
 */


function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLumaEmail(value: unknown): value is LumaEmail {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" && value.id.length > 0 &&
    typeof value.sender === "string" && value.sender.length <= 200 &&
    typeof value.subject === "string" && value.subject.length <= 500 &&
    typeof value.body === "string" && value.body.length <= 12000 &&
    typeof value.receivedAt === "string" &&
    typeof value.requiresAction === "boolean" &&
    typeof value.importantSender === "boolean" &&
    typeof value.isNewsletter === "boolean" &&
    (value.deadline === undefined || typeof value.deadline === "string")
  );
}

export async function POST(request: Request) {
  // Keep this endpoint unavailable on Vercel/production for now.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not enabled." }, { status: 403 });
  }

  // Prevent calls from arbitrary web origins during local development.
  // This is only a basic local safeguard, NOT production authentication.
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const requestUrl = new URL(request.url);
      if (originUrl.host !== requestUrl.host) {
        return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
    }
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 16000) {
      return NextResponse.json({ error: "Request too large." }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!isRecord(body) || !isLumaEmail(body.email)) {
    return NextResponse.json({ error: "Invalid email payload." }, { status: 400 });
  }

  try {
    const analysis = await analyzeEmailWithWatson(body.email);
    return NextResponse.json({ status: "analyzed", analysis });
  } catch {
    // Fail closed: do not silently present a rules-based result as AI.
    return NextResponse.json(
      { status: "needs_review", analysis: manualReviewAnalysis() },
      { status: 502 }
    );
  }
}
