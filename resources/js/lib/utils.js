import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export const debounceInterval = 250;
export const formSubmitErrorMessage = "Please fix the required fields.";