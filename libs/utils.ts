import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class values into a single string using clsx and tailwind-merge
 * Used for conditional and dynamic classnames in components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
