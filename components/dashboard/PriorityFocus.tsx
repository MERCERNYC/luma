"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import type { EmailDecision } from "@/lib/emailIntelligence";

type PriorityFocusProps = {
  decisions: EmailDecision[];
};

export default function PriorityFocus({
  decisions,
}: PriorityFocusProps) {
  const [showPriorities, setShowPriorities] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    null
  );

  // Only actionable, non-suspicious emails can appear
  // in the focus list.
  const topThree = decisions
    .filter(
      (decision) =>
        decision.requiresAction && !decision.needsReview
    )
    .slice(0, 3);

  const selected =
    topThree.find(
      (decision) => decision.email.id === selectedId
    ) ?? topThree[0];

  function handlePrioritize() {
    setShowPriorities(true);
    setSelectedId(topThree[0]?.email.id ?? null);
  }

  return (
    <section className="mt-5 rounded-3xl border border-[#E2E8F5] bg-white p-6 shadow-sm">
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
          className="flex items-center gap-2 rounded-xl bg-[#263C73] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#354F91]"
        >
          <Sparkles size={17} />
          Prioritize with LUMA
          <ArrowRight size={16} />
        </button>
      </div>

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
        <div className="mt-6">
          <div className="flex items-center gap-2 text-[#2D6B59]">
            <CheckCircle2 size={19} />
            <p className="text-sm font-medium">
              Your focus list is ready.
            </p>
          </div>

          <p className="mt-2 text-sm text-[#65718A]">
            Here are up to three emails that need your
            attention first.
          </p>

          {topThree.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[#EAF7F0] p-5">
              <p className="font-medium text-[#2D6B59]">
                No clear action requests found.
              </p>
              <p className="mt-2 text-sm text-[#47685C]">
                You can still review the rest of your inbox.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {/* LEFT: TOP THREE PRIORITIES */}
              <div className="space-y-3">
                {topThree.map((decision, index) => {
                  const isSelected =
                    selected?.email.id === decision.email.id;

                  return (
                    <button
                      key={decision.email.id}
                      type="button"
                      onClick={() =>
                        setSelectedId(decision.email.id)
                      }
                      aria-pressed={isSelected}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-[#8D83C9] bg-[#F3F2FC]"
                          : "border-[#E5E9F2] bg-white hover:bg-[#F8F9FD]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
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

                          <p className="mt-2 text-sm text-[#65718A]">
                            {decision.reason}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* RIGHT: SELECTED EMAIL */}
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

                  <div className="mt-5 border-t border-[#E1E7F1] pt-4">
                    <p className="text-sm leading-6 text-[#33415F]">
                      {selected.email.body}
                    </p>
                  </div>

                  <div className="mt-5 rounded-xl bg-[#EEEAFB] p-4">
                    <p className="text-xs font-semibold uppercase text-[#6256A3]">
                      Why LUMA selected this
                    </p>

                    <p className="mt-2 text-sm text-[#33415F]">
                      {selected.reason}
                    </p>
                  </div>

                  <p className="mt-4 text-xs text-[#65718A]">
                    Demo mode — LUMA has not sent, deleted,
                    or modified this email.
                  </p>
                </article>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}