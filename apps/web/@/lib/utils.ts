import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractErrorMessage(html: string) {
  const match = html.match(/<pre>Error: (.+?)<br>/);
  return match ? match[1] : "Unknown error";
}
