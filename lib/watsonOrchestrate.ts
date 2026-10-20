import type { LumaEmail } from "../types/email";
import {
  buildAgentEmailPrompt,
  parseAgentEmailAnalysis,
  type AgentEmailAnalysis,
} from "./agentEmailAnalysis";

/**
 * IBM Cloud-only starter adapter for watsonx Orchestrate.
 * Credentials and raw email content must stay on the server.
 * This is a development prototype, not a production Gmail integration.
 */

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing server configuration: ${name}`);
  return value;
}

async function getIbmIamToken(apiKey: string): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "urn:ibm:params:oauth:grant-type:apikey",
    apikey: apiKey,
  });

  const response = await fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`IBM IAM authentication failed (${response.status}).`);
  }

  const data: unknown = await response.json();
  if (
    typeof data !== "object" ||
    data === null ||
    !("access_token" in data) ||
    typeof data.access_token !== "string"
  ) {
    throw new Error("IBM IAM did not return an access token.");
  }

  return data.access_token;
}

function extractAssistantText(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Unexpected Watson response.");
  }

  const choices = "choices" in payload ? payload.choices : undefined;
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error("Watson returned no chat choices.");
  }

  const first: unknown = choices[0];
  if (typeof first !== "object" || first === null) {
    throw new Error("Watson returned an invalid chat choice.");
  }

  const message = "message" in first ? first.message : undefined;
  if (typeof message !== "object" || message === null) {
    throw new Error("Watson returned no assistant message.");
  }

  const content = "content" in message ? message.content : undefined;
  if (typeof content !== "string") {
    throw new Error("Watson returned non-text content.");
  }

  return content;
}

export async function analyzeEmailWithWatson(
  email: LumaEmail
): Promise<AgentEmailAnalysis> {
  const baseUrl = requiredEnvironment("WATSON_ORCHESTRATE_BASE_URL")
    .replace(/\/+$/, "");
  const agentId = requiredEnvironment("WATSON_ORCHESTRATE_AGENT_ID");
  const apiKey = requiredEnvironment("IBM_CLOUD_API_KEY");

  // Require HTTPS, preventing accidental transmission of private data
  // to an insecure endpoint.
  const parsedUrl = new URL(baseUrl);
  if (parsedUrl.protocol !== "https:") {
    throw new Error("Watson endpoint must use HTTPS.");
  }

  const accessToken = await getIbmIamToken(apiKey);
  const endpoint =
    `${baseUrl}/v2/orchestrate/${encodeURIComponent(agentId)}/chat/completions`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      stream: false,
      messages: [
        { role: "user", content: buildAgentEmailPrompt(email) },
      ],
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(45000),
  });

  if (!response.ok) {
    // Do not log or return response bodies: they may contain email data.
    throw new Error(`Watson request failed (${response.status}).`);
  }

  const payload: unknown = await response.json();
  return parseAgentEmailAnalysis(extractAssistantText(payload));
}
