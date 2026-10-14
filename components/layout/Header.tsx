
import { Search } from "lucide-react";

// Header is a reusable React component.
// It displays the greeting and user controls.
export default function Header() {
  return (
    <header className="mb-6 flex items-center justify-between gap-4">

      {/* LEFT: Welcome message */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2748]">
          Good morning, Juliana ☀
        </h1>

        <p className="mt-2 text-sm text-[#65718A]">
          A little more clarity. A lot less inbox.
        </p>
      </div>

      {/* RIGHT: Search and profile */}
      <div className="flex items-center gap-4">

        {/* Search button (visual placeholder for now) */}
        <button
          type="button"
          aria-label="Search emails"
          disabled
          title="Search coming soon"
          className="rounded-full p-2 text-[#1B2748] opacity-60"
        >
          <Search size={20} />
        </button>

        {/* User avatar — initials for the MVP */}
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DCE5FA] text-sm font-semibold text-[#1B2748]"
          aria-label="User profile: JM"
        >
          JM
        </div>
      </div>
    </header>
  );
}
