import { Suspense } from "react";
import { connection } from "next/server";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DailyBrief from "@/components/dashboard/DailyBrief";
import CategoryCards from "@/components/dashboard/CategoryCards";
import PriorityFocus from "@/components/dashboard/PriorityFocus";

import { mockEmails } from "@/data/mockEmails";
import { sortEmails } from "@/lib/sortEmails";
import { prioritizeEmails } from "@/lib/emailIntelligence";

async function DashboardContent() {
  // Evaluate email priorities at request time.
  await connection();

  const now = new Date();

  // Existing category cards.
  const sortedEmails = sortEmails(mockEmails, now);

  // New LUMA intelligence engine.
  const decisions = prioritizeEmails(mockEmails, now);

  return (
    <>
      <DailyBrief />

      <PriorityFocus decisions={decisions} />

      <CategoryCards emails={sortedEmails} />
    </>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen bg-[#EAF1FC]">
      <Sidebar />

      <main className="min-w-0 flex-1 p-8">
        <Header />

        <Suspense
          fallback={
            <p className="text-sm text-[#65718A]">
              Organizing your inbox...
            </p>
          }
        >
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  );
}
