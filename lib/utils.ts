import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names safely.
 * Used by shadcn/ui components — import this wherever you need `cn(...)`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
