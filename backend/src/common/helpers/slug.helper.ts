/**
 * Generate a URL-safe slug from a string.
 *
 * "Voltra Phone 15 Pro" → "voltra-phone-15-pro"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-')   // Replace spaces/underscores with hyphens
    .replace(/-+/g, '-')       // Collapse multiple hyphens
    .replace(/^-|-$/g, '');    // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a numeric suffix if needed.
 *
 * @param baseSlug - The base slug to start from
 * @param checkExists - Async function that returns true if slug exists in DB
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;

    // Safety valve — prevent infinite loop
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return slug;
}
