import Sidebar from "@/components/layout/Sidebar";

// Home is the main page of our LUMA application.

export default function Home() {
  return (
    // flex places the sidebar and dashboard side by side.
    // min-h-screen makes the layout fill the browser height.
    <div className="flex min-h-screen bg-[#EAF1FC]">

      {/* LEFT SIDE: Our reusable Sidebar component */}
      <Sidebar />

      {/* RIGHT SIDE: Main dashboard content */}
      {/* flex-1 uses all the space remaining after the sidebar. */}
      <main className="min-w-0 flex-1 p-8">

        {/* HEADER: The first thing users see */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-[#1B2748]">
            Good morning, Juliana ☀
          </h1>

          <p className="mt-2 text-sm text-[#65718A]">
            Welcome to LUMA. Let's make today feel lighter.
          </p>
        </header>

        {/* DASHBOARD: Placeholder for our future components */}
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
