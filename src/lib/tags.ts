import { prisma } from "./prisma";
import { generateSlug } from "./utils";

/**
 * Upsert tags by slug and return their ids.
 *
 * Shared by every draft creator (article / prompt / tool) and by the seed —
 * this loop used to be copy-pasted, which is how the three copies drifted.
 */
export async function upsertTags(names: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const name of names) {
    const slug = generateSlug(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    ids.push(tag.id);
  }
  return ids;
}
