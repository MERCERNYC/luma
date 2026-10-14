"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, X } from "lucide-react";

// Fictional priorities for our first MVP.
const priorities = [
  "Work: Submit project proposal by 3 PM today.",
  "School: Sign the field trip permission form today.",
  "Family: Confirm the pediatrician appointment.",
];

export default function DailyBrief() {
  // React state controls whether the dialog is visible.
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Main Daily Brief card */}
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#E9EDFF] p-2 text-[#5262A8]">
            <Sparkles size={20} />
          </div>

          <div className="flex-1">
            <h2 className="font-semibold text-[#1B2748]">
              Your Daily Brief
            </h2>
            <p className="text-xs text-[#65718A]">
              A clear start to your day
            </p>
          </div>

          <span className="text-xs text-[#65718A]">DEMO</span>
        </div>

        <p className="mt-4 text-sm leading-6 text-[#1B2748]">
          You have <strong>2 deadlines today</strong> and{" "}
          <strong>1 family priority issue</strong> that need your attention.
        </p>

        {/* Open the detailed brief */}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#1B2748] px-4 py-2 text-sm text-white hover:bg-[#303F68]"
          >
            Open brief
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Dialog appears only when isOpen is true */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B2748]/30 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="daily-brief-dialog-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2
                id="daily-brief-dialog-title"
                className="text-xl font-semibold text-[#1B2748]"
              >
                Your work, school, and family priorities — all in one place.
              </h2>

              <button
                type="button"
                aria-label="Close Daily Brief"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-[#65718A] hover:bg-[#EEF1F8]"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-2 text-sm text-[#65718A]">
              Your suggested starting points (demo).
            </p>

            <ul className="mt-5 space-y-3">
              {priorities.map((priority) => (
                <li
                  key={priority}
                  className="rounded-xl bg-[#F3F6FC] p-3 text-sm text-[#1B2748]"
                >
                  {priority}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full rounded-xl bg-[#1B2748] px-4 py-3 text-sm text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
