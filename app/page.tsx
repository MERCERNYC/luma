import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

// This is the LUMA home dashboard.
export default function Home() {
  return (
    <div className="flex min-h-screen bg-[#EAF1FC]">

      {/* LEFT: Navigation */}
      <Sidebar />

      {/* RIGHT: Dashboard */}
      <main className="min-w-0 flex-1 p-8">

        {/* Reusable welcome header */}
        <Header />

        {/* Placeholder for our next dashboard components */}
        <section
          className="rounded-2xl bg-white p-6 shadow-sm"
          aria-label="LUMA dashboard"
        >
          <h2 className="text-lg font-semibold text-[#1B2748]">
            Your dashboard
          </h2>

          <p className="mt-3 text-sm text-[#65718A]">
            Your Daily Brief, priorities, and next steps
            will appear here.
          </p>
        </section>

      </main>
    </div>
  );
}
