
"use client";

/**
 * LUMA — Priority Focus
 * --------------------------------------------------
 *
 * Purpose:
 * Help user focus on up to three important emails
 * instead of managing her entire inbox at once.
 *
 * Responsibilities:
 * 1. Display LUMA's top three actionable emails.
 * 2. Explain why each email was prioritized.
 * 3. Show a preview of the selected email.
 * 4. Allow Sophia to correct LUMA's recommendations.
 * 5. Apply saved user corrections to the ranking.
 *
 * Architecture:
 *
 * mockEmails
 *    ↓
 * detectAction.ts
 *    ↓
 * emailIntelligence.ts
 *    ↓
 * prioritizeEmails()
 *    ↓
 * app/page.tsx
 *    ↓
 * PriorityFocus.tsx
 *    ↓
 * useEmailCorrections.ts
 *
 * Important:
 * - Priority scores are calculated outside this file.
 * - User corrections override the displayed ranking.
 * - Potential spam is excluded from the focus list.
 * - No email is sent, deleted, or modified.
 * - Current data is fictional and rules-based.
 */

import { useState } from "react";

import {
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import type { EmailDecision } from "@/lib/emailIntelligence";

import { useEmailCorrections } from "@/hooks/useEmailCorrections";

/**
 * The parent dashboard supplies decisions that
 * have already been evaluated and sorted.
 */
type PriorityFocusProps = {
  decisions: EmailDecision[];
};

export default function PriorityFocus({
  decisions,
}: PriorityFocusProps) {
  /**
   * UI STATE
   *
   * showPriorities:
   * Controls whether the focus list is visible.
   *
   * selectedId:
   * Identifies the email displayed in the preview.
   */
  const [showPriorities, setShowPriorities] =
    useState(false);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  /**
   * USER CORRECTIONS
   *
   * This custom hook manages:
   * - Important overrides
   * - Not important overrides
   * - Undo
   * - Browser storage persistence
   *
   * Corrections are preferences, not AI training.
   */
  const {
    corrections,
    correctEmail,
    undoCorrection,
    loaded,
  } = useEmailCorrections();

  /**
   * STEP 1 — DETERMINE ELIGIBLE EMAILS
   *
   * Exclude:
   * - Potentially suspicious messages
   * - Messages marked "not important"
   *
   * Include:
   * - Emails LUMA detects as actionable
   * - Emails Sophia explicitly marks important
   *
   * A user correction takes precedence over
   * LUMA's original action recommendation.
   *
   * Safety exception:
   * Suspicious emails cannot be promoted here.
   * They need a separate safe-review workflow.
   */
  const eligibleEmails = decisions.filter(
    (decision) => {
      if (decision.needsReview) {
        return false;
      }

      const correction =
        corrections[decision.email.id];

      if (correction === "not_important") {
        return false;
      }

      return (
        correction === "important" ||
        decision.requiresAction
      );
    }
  );

  /**
   * STEP 2 — APPLY USER PRIORITY OVERRIDES
   *
   * Emails explicitly marked important are moved
   * ahead of emails prioritized by the engine.
   *
   * For emails with equal correction status,
   * preserve the original engine ranking.
   *
   * The index is used as a stable tie-breaker.
   */
  const rankedEmails = eligibleEmails
    .map((decision, index) => ({
      decision,
      index,
    }))
    .sort((a, b) => {
      const aImportant =
        corrections[a.decision.email.id] ===
        "important";

      const bImportant =
        corrections[b.decision.email.id] ===
        "important";

      if (aImportant !== bImportant) {
        return aImportant ? -1 : 1;
      }

      return a.index - b.index;
    })
    .map(({ decision }) => decision);

  /**
   * STEP 3 — SELECT TOP THREE
   *
   * The UI deliberately limits the focus list
   * to three emails to reduce cognitive load.
   */
  const topThree = rankedEmails.slice(0, 3);

  /**
   * STEP 4 — BUILD THE SECONDARY EMAIL LIST
   *
   * User needs a way to find messages that
   * LUMA did not include in the Top 3.
   *
   * This includes routine notifications and
   * messages previously marked not important.
   *
   * Suspicious emails remain excluded.
   */
  const topThreeIds = new Set(
    topThree.map((decision) => decision.email.id)
  );

  const otherEmails = decisions.filter(
    (decision) =>
      !decision.needsReview &&
      !topThreeIds.has(decision.email.id)
  );

  /**
   * STEP 5 — FIND THE SELECTED EMAIL
   *
   * If users's selected email leaves the Top 3
   * after a correction, show the highest-ranked
   * remaining email instead.
   */
  const selected =
    topThree.find(
      (decision) =>
        decision.email.id === selectedId
    ) ?? topThree[0];

  /**
   * EVENT: PRIORITIZE BUTTON
   *
   * Reveals the recommendations and selects
   * the highest-ranked email.
   *
   * The engine has already evaluated the emails.
   * This button does not call an AI model.
   */
  function handlePrioritize() {
    setShowPriorities(true);
    setSelectedId(topThree[0]?.email.id ?? null);
  }

  return (
    <section
      aria-label="LUMA Priority Focus"
      className="mt-5 rounded-3xl border border-[#E2E8F5] bg-white p-6 shadow-sm"
    >
      {/* ======================================
          HEADER
          ====================================== */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles
              size={22}
              className="text-[#7666B3]"
            />

            <h2 className="text-xl font-semibold text-[#1B2748]">
              Your Focus
            </h2>
          </div>

          <p className="mt-2 text-sm text-[#65718A]">
            Less searching. More clarity.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrioritize}
          disabled={!loaded}
          className="flex items-center gap-2 rounded-xl bg-[#263C73] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#354F91] disabled:opacity-50"
        >
          <Sparkles size={17} />

          Prioritize with LUMA

          <ArrowRight size={16} />
        </button>
      </div>

      {/* ======================================
          INITIAL WELCOME STATE
          ====================================== */}

      {!showPriorities ? (
        <div className="mt-6 rounded-2xl bg-[#F3F2FC] p-6 text-center">
          <Sparkles
            size={28}
            className="mx-auto text-[#7666B3]"
          />

          <h3 className="mt-3 font-semibold text-[#1B2748]">
            Ready when you are
          </h3>

          <p className="mt-2 text-sm text-[#65718A]">
            Let LUMA organize your next three priorities.
          </p>
        </div>
      ) : (
        /* ====================================
           PRIORITIZATION RESULTS
           ==================================== */

        <div className="mt-6">
          <div className="flex items-center gap-2 text-[#2D6B59]">
            <CheckCircle2 size={19} />

            <p
              role="status"
              className="text-sm font-medium"
            >
              Your focus list is ready.
            </p>
          </div>

          <p className="mt-2 text-sm text-[#65718A]">
            Here are up to three emails that need your
            attention first. You can change the order
            by marking an email important.
          </p>

          {/* ==================================
              EMPTY STATE
              ================================== */}

          {topThree.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[#EAF7F0] p-5">
              <p className="font-medium text-[#2D6B59]">
                No clear action requests in your focus list.
              </p>

              <p className="mt-2 text-sm text-[#47685C]">
                Review other emails below if LUMA
                missed something important.
              </p>
            </div>
          ) : (
            /* =================================
               TOP THREE + EMAIL PREVIEW
               ================================= */

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {/* LEFT COLUMN: TOP THREE */}

              <div className="space-y-3">
                {topThree.map((decision, index) => {
                  const isSelected =
                    selected?.email.id ===
                    decision.email.id;

                  const correction =
                    corrections[decision.email.id];

                  return (
                    <button
                      key={decision.email.id}
                      type="button"
                      onClick={() =>
                        setSelectedId(
                          decision.email.id
                        )
                      }
                      aria-pressed={isSelected}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-[#8D83C9] bg-[#F3F2FC]"
                          : "border-[#E5E9F2] bg-white hover:bg-[#F8F9FD]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Ranking number */}
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5E4F9] text-sm font-semibold text-[#6256A3]">
                          {index + 1}
                        </span>

                        <div className="min-w-0">
                          <p className="text-xs text-[#65718A]">
                            {decision.email.sender}
                          </p>

                          <h3 className="mt-1 font-semibold text-[#1B2748]">
                            {decision.email.subject}
                          </h3>

                          {/*
                            Show the engine's explanation.
                            If the user promoted the email,
                            also explain the override.
                          */}
                          <p className="mt-2 text-sm text-[#65718A]">
                            {correction === "important"
                              ? "You marked this email important."
                              : decision.reason}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* RIGHT COLUMN: EMAIL PREVIEW */}

              {selected && (
                <article className="rounded-2xl border border-[#E5E9F2] bg-[#F8FAFF] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7666B3]">
                    Email preview
                  </p>

                  <h3 className="mt-3 text-lg font-semibold text-[#1B2748]">
                    {selected.email.subject}
                  </h3>

                  <p className="mt-1 text-sm text-[#65718A]">
                    From: {selected.email.sender}
                  </p>

                  {/*
                    Render the email body as plain text.
                    Do not execute HTML from email content.
                  */}
                  <div className="mt-5 border-t border-[#E1E7F1] pt-4">
                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#33415F]">
                      {selected.email.body}
                    </p>
                  </div>

                  {/* EXPLANATION PANEL */}

                  <div className="mt-5 rounded-xl bg-[#EEEAFB] p-4">
                    <p className="text-xs font-semibold uppercase text-[#6256A3]">
                      Why LUMA selected this
                    </p>

                    <p className="mt-2 text-sm text-[#33415F]">
                      {corrections[selected.email.id] ===
                      "important"
                        ? "You marked this email important. " +
                          selected.reason
                        : selected.reason}
                    </p>
                  </div>

                  {/* =================================
                      HUMAN-IN-THE-LOOP CONTROLS
                      =================================

                      Users can correct LUMA's
                      recommendation without
                      modifying the original email.
                  */}

                  <div className="mt-5 border-t border-[#E1E7F1] pt-4">
                    <p className="mb-3 text-sm font-semibold text-[#1B2748]">
                      Is this priority correct?
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {/* MARK IMPORTANT */}

                      <button
                        type="button"
                        disabled={!loaded}
                        onClick={() =>
                          correctEmail(
                            selected.email.id,
                            "important"
                          )
                        }
                        aria-pressed={
                          corrections[selected.email.id] ===
                          "important"
                        }
                        className="flex items-center gap-2 rounded-xl border border-[#8D83C9] bg-white px-4 py-2 text-sm font-medium text-[#6256A3] hover:bg-[#F3F2FC] disabled:opacity-50"
                      >
                        <ThumbsUp size={15} />
                        Important
                      </button>

                      {/* MARK NOT IMPORTANT */}

                      <button
                        type="button"
                        disabled={!loaded}
                        onClick={() =>
                          correctEmail(
                            selected.email.id,
                            "not_important"
                          )
                        }
                        className="flex items-center gap-2 rounded-xl border border-[#E1E7F1] bg-white px-4 py-2 text-sm text-[#33415F] hover:bg-[#F3F6FC] disabled:opacity-50"
                      >
                        <ThumbsDown size={15} />
                        Not important
                      </button>

                      {/* UNDO USER OVERRIDE */}

                      {corrections[selected.email.id] && (
                        <button
                          type="button"
                          disabled={!loaded}
                          onClick={() =>
                            undoCorrection(
                              selected.email.id
                            )
                          }
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#65718A] hover:bg-[#EEF1F8] disabled:opacity-50"
                        >
                          <RotateCcw size={15} />
                          Undo
                        </button>
                      )}
                    </div>

                    {corrections[selected.email.id] && (
                      <p
                        role="status"
                        className="mt-3 text-xs text-[#6256A3]"
                      >
                        Your preference has been applied.
                      </p>
                    )}
                  </div>

                  {/* SAFETY NOTICE */}

                  <p className="mt-4 text-xs text-[#65718A]">
                    Demo mode — LUMA has not sent,
                    deleted, or modified this email.
                  </p>
                </article>
              )}
            </div>
          )}

          {/* ======================================
              REVIEW OTHER EMAILS
              ======================================

              These emails were not selected for
              the Top 3.

              Sophia can promote a message LUMA
              missed or undo an earlier correction.

              Potentially suspicious emails are
              excluded from this section.
          */}

          {otherEmails.length > 0 && (
            <div className="mt-6 border-t border-[#E1E7F1] pt-5">
              <h3 className="font-semibold text-[#1B2748]">
                Review other emails
              </h3>

              <p className="mt-1 text-sm text-[#65718A]">
                Did LUMA miss something important?
              </p>

              <div className="mt-4 space-y-2">
                {otherEmails.map((decision) => {
                  const correction =
                    corrections[decision.email.id];

                  return (
                    <div
                      key={decision.email.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E9F2] p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-[#65718A]">
                          {decision.email.sender}
                        </p>

                        <p className="text-sm font-medium text-[#1B2748]">
                          {decision.email.subject}
                        </p>

                        {correction === "not_important" && (
                          <p className="mt-1 text-xs text-[#8274C6]">
                            Marked not important
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {/* PROMOTE TO PRIORITY */}

                        <button
                          type="button"
                          disabled={!loaded}
                          onClick={() =>
                            correctEmail(
                              decision.email.id,
                              "important"
                            )
                          }
                          className="flex items-center gap-1 rounded-lg bg-[#EEEAFB] px-3 py-2 text-xs font-medium text-[#6256A3] hover:bg-[#E5DFF9] disabled:opacity-50"
                        >
                          <ThumbsUp size={14} />
                          Important
                        </button>

                        {/* REMOVE USER CORRECTION */}

                        {correction && (
                          <button
                            type="button"
                            disabled={!loaded}
                            onClick={() =>
                              undoCorrection(
                                decision.email.id
                              )
                            }
                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs text-[#65718A] hover:bg-[#F3F6FC] disabled:opacity-50"
                          >
                            <RotateCcw size={14} />
                            Undo
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
