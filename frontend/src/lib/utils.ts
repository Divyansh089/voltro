import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format markdown product descriptions for clean card text previews.
 * Strips markdown symbols (##, **, *, bullets) into clean prose.
 */
export function formatDescriptionPreview(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/^#+\s*/gm, "")           // Remove Markdown header hashes (##, ###)
    .replace(/\*\*(.*?)\*\*/g, "$1")     // Replace **bold** with bold text content
    .replace(/\*(.*?)\*/g, "$1")         // Replace *italic* with text content
    .replace(/[\*\•\-]\s*/g, " • ")       // Replace bullet symbols with clean bullet separators
    .replace(/\n+/g, " ")                // Flatten linebreaks into single spaces
    .replace(/\s+/g, " ")                // Normalize multiple spaces into single space
    .replace(/^[\s\•]+/, "")             // Trim leading bullets/whitespace
    .trim();
}
