import {
  CircleAlert,
  Clock3,
  Newspaper,
} from "lucide-react";

import type { LumaEmail } from "@/types/email";

// TypeScript ensures this component receives sorted emails.
type CategoryCardsProps = {
  emails: LumaEmail[];
};

export default function CategoryCards({
  emails,
}: CategoryCardsProps) {
  // Calculate counts from the emails.
  const actionCount = emails.filter(
    (email) => email.category === "action"
  ).length;

  const laterCount = emails.filter(
    (email) => email.category === "later"
  ).length;

  const newsCount = emails.filter(
    (email) => email.category === "news"
  ).length;

  return (
    <section
      aria-label="Email categories"
      className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3"
    >
      {/* Action Needed */}
      <div className="rounded-2xl bg-[#FFF0EB] p-5">
        <CircleAlert className="text-[#C46C5B]" size={22} />
        <p className="mt-3 text-3xl font-bold text-[#713C35]">
          {actionCount}
        </p>
        <h2 className="mt-1 text-sm font-semibold text-[#713C35]">
          Action Needed
        </h2>
      </div>

      {/* For Later */}
      <div className="rounded-2xl bg-[#F0EDFF] p-5">
        <Clock3 className="text-[#8274C6]" size={22} />
        <p className="mt-3 text-3xl font-bold text-[#51478C]">
          {laterCount}
        </p>
        <h2 className="mt-1 text-sm font-semibold text-[#51478C]">
          For Later
        </h2>
      </div>

      {/* News & Updates */}
      <div className="rounded-2xl bg-[#E4F6EE] p-5">
        <Newspaper className="text-[#398A73]" size={22} />
        <p className="mt-3 text-3xl font-bold text-[#2D6B59]">
          {newsCount}
        </p>
        <h2 className="mt-1 text-sm font-semibold text-[#2D6B59]">
          News & Updates
        </h2>
      </div>
    </section>
  );
}
