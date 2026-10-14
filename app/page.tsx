import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DailyBrief from "@/components/dashboard/DailyBrief";
import CategoryCards from "@/components/dashboard/CategoryCards";
import { mockEmails } from "@/data/mockEmails";
import { sortEmails } from "@/lib/sortEmails";

export default function Home() {
  // Run our sorting engine on the demo emails.
  const sortedEmails = sortEmails(mockEmails);

  return (
    <div className="flex min-h-screen bg-[#EAF1FC]">
      <Sidebar />

      <main className="min-w-0 flex-1 p-8">
        <Header />
        <DailyBrief />

        {/* Category counts from our sorting engine */}
        <CategoryCards emails={sortedEmails} />
      </main>
    </div>
  );
}
