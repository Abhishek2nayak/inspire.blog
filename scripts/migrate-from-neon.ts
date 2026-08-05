/**
 * One-off import of the content exported from the previous (Neon) database.
 *
 * WHY IDs ARE REMAPPED RATHER THAN REUSED: the export references the old
 * database's User/Category/AiModel rows by cuid, and the new database was
 * seeded fresh, so those cuids do not exist here. Author, category and model
 * are therefore resolved by a stable natural key (email / slug) instead.
 *
 * Tag, Prompt, Article and PromptExample rows DO keep their original ids —
 * nothing outside this export references them, and preserving them keeps the
 * join rows (ArticleTag) valid without a second mapping table.
 *
 * Idempotent: every write is an upsert keyed on id, so re-running repairs
 * rather than duplicates. Safe to run against a database that already has some
 * of this content.
 *
 *   npx tsx scripts/migrate-from-neon.ts            # apply
 *   npx tsx scripts/migrate-from-neon.ts --dry-run  # report only
 */
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const DRY = process.argv.includes("--dry-run");

/* ── natural keys from the old export ───────────────────────────────────── */

const AUTHOR_EMAIL = "abhishek5nayak22@gmail.com";

/**
 * The old category/model cuids carry the seed's insertion counter in
 * characters 9-12 (`...0003...`, `...000a...`). Both databases ran the same
 * seed in the same order, so those counters identify the row: 0003 was the
 * first Category (ai-image-design) and 000a was the third AiModel
 * (chatgpt-image). Resolved by slug here so the mapping is explicit and
 * checkable rather than hidden in an id.
 */
const CATEGORY_SLUG = "ai-image-design";
const MODEL_SLUG = "chatgpt-image";

/* ── data ───────────────────────────────────────────────────────────────── */

const TAGS = [
  { id: "cmsbin0tm000429nbj0pi8jfa", name: "instagram post", slug: "instagram-post" },
  { id: "cmsbin2a6000529nbkhr2ts6f", name: "ai  viral prompt", slug: "ai-viral-prompt" },
  { id: "cmsbin3p0000629nbt71hizrb", name: "image prompt", slug: "image-prompt" },
  { id: "cmsbin4lj000729nbvy7swplg", name: "viral post prompt", slug: "viral-post-prompt" },
  { id: "cmsby63yr000076o4i6rny05j", name: "youtube thumbnail prompts", slug: "youtube-thumbnail-prompts" },
  { id: "cmsby660s000176o4e9icpvfb", name: "ai thumbnail generator", slug: "ai-thumbnail-generator" },
  { id: "cmsby66wf000276o43ih88sos", name: "midjourney thumbnail prompts", slug: "midjourney-thumbnail-prompts" },
  { id: "cmsby67rt000376o45vfu6i2k", name: "youtube ctr", slug: "youtube-ctr" },
  { id: "cmsby69d5000476o4n9xtedig", name: "image prompts for creators", slug: "image-prompts-for-creators" },
  { id: "cmsby6a8g000576o4ycv31oin", name: "prompt engineering", slug: "prompt-engineering" },
  { id: "cmsby6b3q000676o4ljoecj2t", name: "viral prompt", slug: "viral-prompt" },
];

const ARTICLE_TAG_IDS = [
  "cmsby63yr000076o4i6rny05j",
  "cmsby660s000176o4e9icpvfb",
  "cmsby66wf000276o43ih88sos",
  "cmsby67rt000376o45vfu6i2k",
  "cmsby69d5000476o4n9xtedig",
  "cmsby6a8g000576o4ycv31oin",
  "cmsby6b3q000676o4ljoecj2t",
];

const PROMPT_EXAMPLES = [
  {
    id: "cmsbil4hp000129nbhfx40v6l",
    alt: "Golden Eye Beam Portrait Prompt | Photorealistic Cinematic Headshot",
    height: 1402, width: 1122, isVideo: false, order: 0,
    promptId: "cmsbijpsh0001f932szxz7fs4",
    url: "https://res.cloudinary.com/dljyyhmbl/image/upload/v1785657858/makeframe/iu58zgmvjijv65px0ngy.jpg",
  },
  {
    id: "cmsbim76n000329nbu5cykq06",
    alt: "Golden Eye Beam Portrait Prompt | Photorealistic Cinematic Headshot",
    height: 1448, width: 1086, isVideo: false, order: 1,
    promptId: "cmsbijpsh0001f932szxz7fs4",
    url: "https://res.cloudinary.com/dljyyhmbl/image/upload/v1785657910/makeframe/apctishc3bdut2ny3yfa.jpg",
  },
  {
    id: "cmsbj4xc60003jqkycswmr6jy",
    alt: "Ultra-Cinematic Red Silhouette Portrait Prompt |",
    height: 1536, width: 1024, isVideo: false, order: 0,
    promptId: "cmsbj34hz0001jqkyrut7kofh",
    url: "https://res.cloudinary.com/dljyyhmbl/image/upload/v1785658783/makeframe/o0o1t939de1mrlrzerds.jpg",
  },
  {
    id: "cmsbjate20005jqky1koz9huy",
    alt: "Ultra-Cinematic Red Silhouette Portrait Prompt |",
    height: 1536, width: 1024, isVideo: false, order: 1,
    promptId: "cmsbj34hz0001jqkyrut7kofh",
    url: "https://res.cloudinary.com/dljyyhmbl/image/upload/v1785659057/makeframe/ifdsjroarc1dirjedcyo.jpg",
  },
  {
    id: "cmscs357b000112zjljvajmq8",
    alt: "Divine Surrender Under Krishna's Gaze — Cinematic Underwater Portrait Prompt",
    height: 1402, width: 1122, isVideo: false, order: 0,
    promptId: "cmscs27w70001ozcg0sq5bhwl",
    url: "https://res.cloudinary.com/dljyyhmbl/image/upload/v1785734281/makeframe/fhdqgcgwyit6pjlbxjju.jpg",
  },
];

const PROMPT_BODIES: Record<string, string> = {
  "cmsbijpsh0001f932szxz7fs4": `Analyze the uploaded image and recreate it with maximum visual fidelity. Generate an ultra-detailed photorealistic portrait matching the exact composition, lighting, mood, and color treatment of the reference.

Subject:
Handsome masculine male with thick wavy dark hair, strong jawline, prominent eyebrows, light-colored eyes, and subtle facial stubble. Three-quarter profile facing left, gaze directed off-camera. Serious, intense, contemplative expression.

Composition:
Tight head-and-neck crop, vertical portrait orientation, subject centered with slight right-side weighting. Camera positioned near eye level with a subtle low-angle perspective. Eyes placed near the upper third of the frame.

Lighting:
Dramatic low-key cinematic lighting. Nearly the entire image is rendered in deep monochrome blacks and charcoal tones. A narrow horizontal beam of warm golden-amber light cuts across the eyes and upper cheeks, creating a striking contrast. The illuminated strip should be sharp-edged and highly defined, as if sunlight is passing through a narrow slit or window opening. Eyes glow naturally within the light band.

Color Grading:
Selective color effect. Entire portrait remains desaturated black-and-white except for the warm golden light crossing the eyes. Rich blacks, crushed shadows, subtle cool undertones in dark regions, golden highlights only within the illuminated strip.

Background:
Pure black seamless background with no visible detail.

Texture and Detail:
Extremely realistic skin pores, natural facial texture, detailed beard stubble, sharp eyelashes, defined eyebrows, realistic hair strands with subtle highlights. Preserve micro-contrast and high-frequency detail.

Wardrobe:
Black collared shirt blending into the shadows.

Mood:
Mysterious, cinematic, powerful, luxury editorial fashion photography, fine-art portrait aesthetic.

Camera Settings (Approximate):
- 85mm portrait lens
- f/2.0 aperture
- Shallow depth of field
- ISO 100
- Studio-quality sharpness
- Ultra-high dynamic range

Post-processing:
- High contrast
- Dodge and burn refinement
- Selective color isolation
- Enhanced eye clarity
- Deep shadow retention
- Premium editorial retouching
- Photorealistic skin rendering

Output:
Ultra-realistic black-and-gold cinematic portrait with a narrow golden light band crossing the eyes, matching the reference image as closely as possible.`,

  "cmsbj34hz0001jqkyrut7kofh": `Ultra-cinematic dramatic red silhouette portrait of a young man in side profile, captured from the shoulders up, standing in a contemplative pose. The man has messy textured hair and a short rugged beard (keep face and hairstyle 100% identical to the uploaded reference image), wearing a casual dark hoodie with soft natural fabric folds and realistic cloth texture. His eyes are closed, and his fingers gently touch his temple, suggesting deep thought, emotional tension, or inner conflict.

Style: Ultra-photorealistic, cinematic, high contrast, dramatic red lighting, deep shadows, premium color grading, shallow depth of field, realistic skin texture, highly detailed fabric, film still aesthetic, emotional storytelling, 8K quality, sharp focus, masterpiece.`,

  "cmscs27w70001ozcg0sq5bhwl": `A dramatic underwater scene of a young man floating with his eyes closed in complete surrender, wearing a black sleeveless shirt. He is surrounded by deep blue water with particles and bubbles floating around him. Behind him, filling the entire background, is the gigantic, divine face of Krishna, with intense, mesmerizing eyes watching over him and a glowing tilak on the forehead. The composition symbolizes protection, surrender, and divine presence. Cinematic lighting with rays of light filtering through water, high contrast, ultra-detailed, photorealistic, 8K, fantasy-realism blend, spiritual and powerful mood.

Camera angle: low angle looking up at the floating man
Composition: man in foreground center, Krishna's eyes dominating the background
Lighting: volumetric, dramatic, god rays from above
Color grading: deep blue tones with golden accents
Details: realistic skin texture, water caustics on skin, ultra-detailed eyes in background, divine glow on tilak
Mood: spiritual, intense, awe-inspiring
Style reference: cinematic, photorealistic, fantasy, spiritual art`,
};

const PROMPTS = [
  {
    id: "cmsbijpsh0001f932szxz7fs4",
    slug: "golden-eye-beam-portrait-prompt-or-photorealistic-cinematic-headshot",
    title: "Golden Eye Beam Portrait Prompt | Photorealistic Cinematic Headshot",
    metaTitle: "Golden Eye Beam Portrait Prompt | Photorealistic Cinematic Headshot",
    description:
      "Transform any portrait into a dramatic masterpiece using a narrow golden light beam, rich monochrome shadows, hyper-realistic facial details, and premium fashion-inspired cinematic lighting.",
    metaDesc:
      "Transform any portrait into a dramatic masterpiece using a narrow golden light beam, rich monochrome shadows, hyper-realistic facial details, and premium f",
    negative:
      "Cartoon, illustration, CGI, painting, low resolution, blurry eyes, soft focus, flat lighting, colorful background, multiple subjects, smiling expression, exaggerated skin smoothing, lens distortion, text, watermark, logo, accessories, glasses, jewelry, hats, overexposed highlights, low contrast, noisy image, artificial skin texture.",
    parameters: null as string | null,
    aspectRatio: "16:9",
    outputType: "YOUTUBE_THUMBNAIL" as const,
    kind: "IMAGE" as const,
    difficulty: "BEGINNER" as const,
    status: "PUBLISHED" as const,
    featured: true,
    copies: 2,
    priceCents: 0,
    platformFeePercent: 20,
    createdAt: "2026-08-02T08:03:16.434Z",
    publishedAt: "2026-08-02T08:06:00.380Z",
    updatedAt: "2026-08-02T19:56:04.509Z",
  },
  {
    id: "cmsbj34hz0001jqkyrut7kofh",
    slug: "ultra-cinematic-red-silhouette-portrait-prompt-or",
    title: "Ultra-Cinematic Red Silhouette Portrait Prompt |",
    metaTitle: "Ultra-Cinematic Red Silhouette Portrait Prompt |",
    description:
      "Create a powerful cinematic portrait featuring a young man in side profile, illuminated as a striking red silhouette. This prompt captures an introspective mood with dramatic lighting, realistic clothing textures, and a contemplative pose, making it perfect for creating emotionally charged, movie-quality AI portraits.",
    metaDesc:
      "Create a powerful cinematic portrait featuring a young man in side profile, illuminated as a striking red silhouette. This prompt captures an introspective",
    negative:
      "Low quality, blurry, cartoon, anime, CGI, overexposed, underexposed, extra fingers, deformed hands, bad anatomy, distorted face, incorrect hairstyle, duplicated features, unrealistic clothing, text, watermark, logo, noise, artifacts.",
    parameters: null as string | null,
    aspectRatio: null as string | null,
    outputType: "INSTAGRAM_POST" as const,
    kind: "IMAGE" as const,
    difficulty: "BEGINNER" as const,
    status: "PUBLISHED" as const,
    featured: false,
    copies: 0,
    priceCents: 0,
    platformFeePercent: 20,
    createdAt: "2026-08-02T08:18:21.959Z",
    publishedAt: "2026-08-02T08:24:30.346Z",
    updatedAt: "2026-08-02T08:24:30.347Z",
  },
  {
    id: "cmscs27w70001ozcg0sq5bhwl",
    slug: "divine-surrender-under-krishnas-gaze-cinematic-underwater-portrait-prompt",
    title: "Divine Surrender Under Krishna's Gaze — Cinematic Underwater Portrait Prompt",
    metaTitle: "Divine Surrender Under Krishna's Gaze — Cinematic Underwater Portrait Prompt",
    description:
      "Create a breathtaking cinematic underwater portrait where a man peacefully floats in complete surrender beneath the divine gaze of Lord Krishna. Featuring dramatic god rays, deep blue tones, realistic water caustics, ultra-detailed textures, and a powerful fantasy-realism aesthetic, this prompt delivers a spiritual masterpiece filled with protection, serenity, and divine presence.",
    metaDesc:
      "Create a breathtaking cinematic underwater portrait where a man peacefully floats in complete surrender beneath the divine gaze of Lord Krishna. Featuring ",
    negative: null as string | null,
    parameters: "--ar 4:5 --v 6 --style raw --q 2",
    aspectRatio: null as string | null,
    outputType: "INSTAGRAM_POST" as const,
    kind: "IMAGE" as const,
    difficulty: "BEGINNER" as const,
    status: "DRAFT" as const,
    featured: false,
    copies: 0,
    priceCents: 0,
    platformFeePercent: 20,
    createdAt: "2026-08-03T05:17:22.423Z",
    publishedAt: null as string | null,
    updatedAt: "2026-08-03T05:17:22.423Z",
  },
];

/* ── main ───────────────────────────────────────────────────────────────── */

async function main() {
  const author = await prisma.user.findUnique({ where: { email: AUTHOR_EMAIL }, select: { id: true } });
  const category = await prisma.category.findUnique({ where: { slug: CATEGORY_SLUG }, select: { id: true } });
  const model = await prisma.aiModel.findUnique({ where: { slug: MODEL_SLUG }, select: { id: true } });

  if (!author) throw new Error(`author ${AUTHOR_EMAIL} not found — run the seed first`);
  if (!category) throw new Error(`category ${CATEGORY_SLUG} not found — run the seed first`);
  if (!model) throw new Error(`model ${MODEL_SLUG} not found — run the seed first`);

  console.log(`\n  author   ${AUTHOR_EMAIL}  -> ${author.id}`);
  console.log(`  category ${CATEGORY_SLUG}     -> ${category.id}`);
  console.log(`  model    ${MODEL_SLUG}      -> ${model.id}`);
  if (DRY) console.log("\n  --dry-run: nothing will be written\n");

  const { ARTICLE, ARTICLE_CONTENT } = await import("./migrate-from-neon.data");

  let n = { tags: 0, prompts: 0, examples: 0, articles: 0, links: 0 };

  for (const t of TAGS) {
    if (!DRY) await prisma.tag.upsert({ where: { id: t.id }, update: { name: t.name, slug: t.slug }, create: t });
    n.tags++;
  }

  for (const p of PROMPTS) {
    const data = {
      ...p,
      body: PROMPT_BODIES[p.id],
      authorId: author.id,
      categoryId: category.id,
      modelId: model.id,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
      publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
    } satisfies Prisma.PromptUncheckedCreateInput;

    if (!DRY) {
      await prisma.prompt.upsert({ where: { id: p.id }, update: data, create: data });
      // Tag the two published prompts with the four prompt-flavoured tags.
      if (p.status === "PUBLISHED") {
        for (const tagId of ["cmsbin0tm000429nbj0pi8jfa", "cmsbin2a6000529nbkhr2ts6f", "cmsbin3p0000629nbt71hizrb", "cmsbin4lj000729nbvy7swplg"]) {
          await prisma.promptTag.upsert({
            where: { promptId_tagId: { promptId: p.id, tagId } },
            update: {}, create: { promptId: p.id, tagId },
          });
        }
      }
    }
    n.prompts++;
  }

  for (const e of PROMPT_EXAMPLES) {
    if (!DRY) await prisma.promptExample.upsert({ where: { id: e.id }, update: e, create: e });
    n.examples++;
  }

  const articleData = {
    ...ARTICLE,
    content: ARTICLE_CONTENT,
    authorId: author.id,
    createdAt: new Date(ARTICLE.createdAt),
    updatedAt: new Date(ARTICLE.updatedAt),
    publishedAt: ARTICLE.publishedAt ? new Date(ARTICLE.publishedAt) : null,
  } satisfies Prisma.ArticleUncheckedCreateInput;

  if (!DRY) await prisma.article.upsert({ where: { id: ARTICLE.id }, update: articleData, create: articleData });
  n.articles++;

  for (const tagId of ARTICLE_TAG_IDS) {
    if (!DRY) {
      await prisma.articleTag.upsert({
        where: { articleId_tagId: { articleId: ARTICLE.id, tagId } },
        update: {}, create: { articleId: ARTICLE.id, tagId },
      });
    }
    n.links++;
  }

  console.log(`\n  ${DRY ? "would import" : "imported"}:`, n);
}

main()
  .catch((e) => { console.error("\n  FAILED:", e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
