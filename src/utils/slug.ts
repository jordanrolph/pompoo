import { db } from "~/server/db";

function generateSlugFromName(name: string): string {
  // Replace "&" with "and"
  let slug = name.replace(/&/g, "and");

  // Replace spaces with "-"
  slug = slug.replace(/\s+/g, "-");

  // Convert to lowercase
  slug = slug.toLowerCase();

  // Make the string safe for a URL
  slug = encodeURIComponent(slug);

  return slug;
}

async function addSlugsToDB() {
  const bathingSites = await db.bathingSite.findMany();

  bathingSites.map(async (bathingSite) => {
    await db.bathingSite.update({
      where: {
        id: bathingSite.id,
      },
      data: {
        slug: generateSlugFromName(bathingSite.name),
      },
    });
  });
}
