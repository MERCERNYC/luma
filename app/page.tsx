import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DailyBrief from "@/components/dashboard/DailyBrief";
import CategoryCards from "@/components/dashboard/CategoryCards";
import { mockEmails } from "@/data/mockEmails";
import { sortEmails } from "@/lib/sortEmails";
import { connection } from "next/server";

export default async function Home() {
  // Wait for a request before using the current time.
  await connection();

  const sortedEmails = sortEmails(mockEmails, new Date());

  return (
    <div className="flex min-h-screen bg-[#EAF1FC]">
      <Sidebar />

      <main className="min-w-0 flex-1 p-8">
        <Header />
        <DailyBrief />
        <CategoryCards emails={sortedEmails} />
      </main>
    </div>
  );
}
