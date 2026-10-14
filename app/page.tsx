
import { Suspense } from "react";
import { connection } from "next/server";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DailyBrief from "@/components/dashboard/DailyBrief";
import CategoryCards from "@/components/dashboard/CategoryCards";

import { mockEmails } from "@/data/mockEmails";
import { sortEmails } from "@/lib/sortEmails";

// This component calculates priorities at request time.
async function DashboardContent() {
  // Next.js waits for a request before accessing the clock.
  await connection();

  const sortedEmails = sortEmails(mockEmails, new Date());

  return (
    <>
      <DailyBrief />
      <CategoryCards emails={sortedEmails} />
    </>
  );
}

// This is the main LUMA page.
export default function Home() {
  return (
    <div className="flex min-h-screen bg-[#EAF1FC]">
      <Sidebar />

      <main className="min-w-0 flex-1 p-8">
        <Header />

        {/* Suspense allows the dashboard to load dynamically. */}
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
