/**
 * Seed content for Makeframe.
 *
 * Kept separate from seed.ts so the data is easy to review and extend without
 * touching the upsert logic.
 *
 * A NOTE ON EXAMPLE IMAGES: prompts here ship WITHOUT PromptExample rows,
 * because the example has to be the real output of actually running the
 * prompt — it cannot be authored. The admin flow is: run the prompt in the
 * tool, upload the result via /api/upload, attach it, then it's complete.
 * PromptCard renders a typographic fallback until then, so the site is
 * browsable immediately.
 *
 * A NOTE ON TOOL RATINGS: left null deliberately. A rating should reflect
 * someone actually using the tool, and fabricated ratings in
 * SoftwareApplication markup violate Google's structured-data policy.
 * Set them in the dashboard once you've formed a real opinion.
 *
 * A NOTE ON PRICING: tier only (FREE / FREEMIUM / PAID), which is stable.
 * Exact prices change constantly — priceNote stays qualitative rather than
 * quoting figures that will be wrong within a month.
 */

import type { OutputType, PromptKind, Difficulty, PricingTier, ArticleKind } from "@prisma/client";

export interface SeedPrompt {
  title: string;
  slug: string;
  body: string;
  negative?: string;
  description: string;
  tips?: string;
  kind: PromptKind;
  outputType: OutputType;
  difficulty: Difficulty;
  aspectRatio?: string;
  parameters?: string;
  modelSlug: string;
  categorySlug: string;
  tags: string[];
  featured?: boolean;
  variations?: { label: string; body: string }[];
  toolSlugs?: string[];
}

export const PROMPTS: SeedPrompt[] = [
  {
    title: "High-contrast YouTube thumbnail with a reacting face",
    slug: "youtube-thumbnail-reacting-face",
    body: `Close-up portrait of a person with an exaggerated surprised expression, mouth slightly open, eyebrows raised high. Shot on 85mm lens, shallow depth of field. Dramatic rim lighting from the left in electric orange, cool teal fill from the right. Subject occupies the right third of the frame, left two thirds is clean negative space with a subtly blurred background. Ultra sharp facial detail, high micro-contrast, punchy saturated colour grade, cinematic.`,
    negative: "text, watermark, logo, cluttered background, multiple people, blurry face",
    description:
      "The workhorse thumbnail composition: one face, one emotion, and a deliberately empty half of the frame for your title text. Rim lighting is what separates the subject from the background at 120px.",
    tips: `<p>The empty left third is the whole point — that is where your title goes. If you generate a centred subject you will have nowhere to put text and the thumbnail will fail at small sizes.</p><p>Swap "surprised" for <em>skeptical</em>, <em>delighted</em> or <em>exhausted</em> to match the video. Keep the lighting description identical so a series stays visually consistent.</p><p>Always check it at 10% zoom before committing. If you cannot read the emotion, neither can anyone scrolling.</p>`,
    kind: "IMAGE",
    outputType: "YOUTUBE_THUMBNAIL",
    difficulty: "BEGINNER",
    aspectRatio: "16:9",
    parameters: "--ar 16:9 --style raw",
    modelSlug: "midjourney",
    categorySlug: "ai-image-design",
    tags: ["thumbnail", "youtube", "portrait", "lighting"],
    featured: true,
    variations: [
      {
        label: "Skeptical / debunking video",
        body: `Close-up portrait of a person with one eyebrow raised, lips pressed in a skeptical half-smile, arms crossed. Shot on 85mm lens, shallow depth of field. Hard rim light from the left in cold blue, warm amber fill from the right. Subject on the right third, clean negative space to the left. Ultra sharp facial detail, punchy contrast, cinematic.`,
      },
      {
        label: "Product / unboxing video",
        body: `Close-up of a person holding a product up beside their face, looking directly at the camera with a delighted expression. Shot on 50mm lens. Bright even key light with a soft orange rim from behind. Subject and product on the right third, clean gradient negative space on the left. Crisp product detail, punchy saturated grade.`,
      },
    ],
    toolSlugs: ["midjourney"],
  },
  {
    title: "Vertical reel opener that survives the first two seconds",
    slug: "reel-opener-hook-shot",
    body: `Vertical 9:16 cinematic shot. Camera pushes in fast toward a single subject standing in a dim room, then snaps to a stop. Volumetric light beams cut diagonally through drifting dust. Subject is backlit, face partially in shadow, turning toward the camera on the final beat. Shallow depth of field, anamorphic flare, film grain, moody teal and amber grade. Duration 4 seconds, one continuous take.`,
    description:
      "A hook shot built for the scroll: fast push-in, hard stop, and a face turn on the last beat. Vertical framing with the subject's head in the upper third so captions do not cover it.",
    tips: `<p>Describe the <strong>camera move</strong> and the <strong>duration</strong> explicitly. Video models default to slow drifting motion, which is exactly what loses the viewer in the first second.</p><p>Keep the subject's head in the upper third — the lower quarter gets covered by captions, the username and the UI on every platform.</p><p>Generate three takes and keep the one where the motion resolves cleanly. Video models are far less consistent than image models, so budget for retries.</p>`,
    kind: "VIDEO",
    outputType: "REEL_SHORT",
    difficulty: "INTERMEDIATE",
    aspectRatio: "9:16",
    modelSlug: "sora",
    categorySlug: "ai-video-audio",
    tags: ["reels", "shorts", "hook", "cinematic", "vertical"],
    featured: true,
    variations: [
      {
        label: "Bright / lifestyle version",
        body: `Vertical 9:16 shot. Camera pushes in toward a subject by a sunlit window, then holds. Warm morning light, sheer curtains moving slightly. Subject turns toward camera on the final beat, natural smile. Shallow depth of field, clean bright grade, subtle handheld motion. Duration 4 seconds, one continuous take.`,
      },
    ],
    toolSlugs: ["sora", "runway"],
  },
  {
    title: "Instagram carousel set with a locked visual system",
    slug: "instagram-carousel-consistent-system",
    body: `Editorial flat-lay photograph on a warm bone paper background. A single subject object centred with generous margins. Soft directional window light from the upper left casting a long soft shadow to the lower right. Muted earthy palette of bone, terracotta and sage. Shot from directly overhead, 45mm lens, natural texture visible in the paper. Minimal, calm, high-end magazine styling.`,
    negative: "text, logo, busy background, harsh shadows, saturated colours",
    description:
      "A base prompt for multi-slide carousels. Change only the subject object between slides and keep every other clause identical — that is what makes ten separate generations read as one set.",
    tips: `<p>The technique: freeze the background, lighting, palette, lens and angle, then vary <em>only</em> the subject noun per slide. Change anything else and the set stops looking like a set.</p><p>Generate all slides in one session. Models drift between sessions even with identical prompts.</p><p>Leave the generous margins in — Instagram crops carousels differently in feed and in profile grid.</p>`,
    kind: "IMAGE",
    outputType: "INSTAGRAM_CAROUSEL",
    difficulty: "INTERMEDIATE",
    aspectRatio: "4:5",
    parameters: "--ar 4:5 --style raw",
    modelSlug: "nano-banana",
    categorySlug: "ai-image-design",
    tags: ["instagram", "carousel", "flat lay", "consistency"],
    featured: true,
    toolSlugs: ["canva"],
  },
  {
    title: "Wide channel banner that survives centre-cropping",
    slug: "channel-banner-safe-crop",
    body: `Ultra-wide abstract background. Layered translucent geometric shapes in a muted gradient, drifting from deep indigo on the left to warm coral on the right. Soft grain texture over the whole frame. All visual interest sits in the centre third; the outer thirds fade to a near-flat gradient. No focal subject, no text. Clean, modern, subtle.`,
    negative: "text, logo, faces, busy detail at the edges, hard edges",
    description:
      "YouTube crops channel art brutally differently on TV, desktop and mobile. This prompt deliberately keeps everything important in the safe centre band and lets the edges fade.",
    tips: `<p>YouTube's safe area is 1546×423 inside a 2560×1440 canvas. Anything outside that is gone on mobile — which is why this prompt pushes all detail to the centre third.</p><p>Add your text in Canva or Figma afterwards, not in the prompt. Image models still mangle typography, and you want crisp vector text here.</p>`,
    kind: "IMAGE",
    outputType: "BANNER",
    difficulty: "BEGINNER",
    aspectRatio: "16:9",
    parameters: "--ar 16:9",
    modelSlug: "flux",
    categorySlug: "ai-image-design",
    tags: ["banner", "youtube", "channel art", "abstract"],
    toolSlugs: ["canva", "figma"],
  },
  {
    title: "Studio product shot on a seamless backdrop",
    slug: "product-shot-seamless-backdrop",
    body: `Professional product photograph of [PRODUCT] on a seamless backdrop in soft off-white. Three-point studio lighting: large softbox key from the upper left, subtle fill from the right, crisp rim light separating the product from the background. Product centred, shot at eye level on a 100mm macro lens. Razor sharp detail on the surface texture, realistic soft contact shadow beneath. Commercial e-commerce styling, no props.`,
    negative: "hands, people, text, watermark, cluttered props, harsh reflections",
    description:
      "Replace [PRODUCT] and you have catalogue-grade product photography without a lighting rig. The contact shadow is what stops it looking like a floating cut-out.",
    tips: `<p>Describe the <strong>material</strong> in the product noun — "matte ceramic mug", "brushed aluminium bottle". Models light reflective and matte surfaces completely differently, and material is the single highest-leverage word here.</p><p>The "realistic soft contact shadow" clause matters more than it looks. Without it you get a floating object that reads as fake immediately.</p><p>For a consistent catalogue, keep the lighting clause byte-identical across every product.</p>`,
    kind: "IMAGE",
    outputType: "PRODUCT_SHOT",
    difficulty: "BEGINNER",
    aspectRatio: "1:1",
    parameters: "--ar 1:1 --style raw",
    modelSlug: "chatgpt-image",
    categorySlug: "ai-image-design",
    tags: ["product", "ecommerce", "studio", "lighting"],
    toolSlugs: ["chatgpt"],
  },
  {
    title: "Quote card with real typographic hierarchy",
    slug: "instagram-quote-card",
    body: `Minimal typographic poster on a textured bone paper background with visible paper grain. A short quote set in a large high-contrast serif, centred, with generous line spacing and wide margins. A single thin horizontal rule beneath the quote. One small accent shape in muted coral in the lower right corner. Editorial, calm, print-inspired. Risograph texture.`,
    description:
      "A quote card that looks designed rather than generated. The grain and the single accent shape are what stop it reading as a default template.",
    tips: `<p>Image models are still unreliable at rendering specific words. Generate this as a <em>background and layout</em>, then set the actual quote text in Canva or Figma on top.</p><p>If you do let the model attempt the text, ChatGPT Image is currently the most reliable of the image models at legible typography — but always proofread it.</p>`,
    kind: "IMAGE",
    outputType: "INSTAGRAM_POST",
    difficulty: "BEGINNER",
    aspectRatio: "4:5",
    parameters: "--ar 4:5",
    modelSlug: "midjourney",
    categorySlug: "ai-image-design",
    tags: ["instagram", "quote", "typography", "riso"],
    toolSlugs: ["canva"],
  },
  {
    title: "Scroll-stopping ad creative with space reserved for copy",
    slug: "ad-creative-with-copy-space",
    body: `Vibrant lifestyle product photograph. [PRODUCT] held casually in frame by a person, shot slightly off-centre to the lower left. Bright natural daylight, clean modern interior blurred behind. Upper right 40% of the frame is intentionally clean and uncluttered for headline text. Punchy saturated colour, crisp detail, authentic UGC feel rather than studio polish.`,
    negative: "text, logo, watermark, cluttered background, stock-photo smiles",
    description:
      "Paid-social creative that leaves a deliberate empty zone for the headline and CTA — the thing most AI ad creative forgets, which makes it unusable without a recrop.",
    tips: `<p>The "upper right 40% clean" clause is the whole trick. Composition-aware prompting saves you from cropping every generation to fit the copy.</p><p>"Authentic UGC feel rather than studio polish" consistently outperforms polished studio shots on paid social — it reads as a recommendation rather than an ad.</p><p>Generate 4–6 and A/B test. Ad creative is a numbers game and per-image quality matters less than variety.</p>`,
    kind: "IMAGE",
    outputType: "AD_CREATIVE",
    difficulty: "INTERMEDIATE",
    aspectRatio: "1:1",
    parameters: "--ar 1:1 --style raw",
    modelSlug: "flux",
    categorySlug: "ai-for-creators",
    tags: ["ads", "paid social", "ugc", "conversion"],
    toolSlugs: ["canva"],
  },
  {
    title: "Consistent profile avatar in a repeatable style",
    slug: "avatar-consistent-style",
    body: `Head-and-shoulders portrait, subject facing camera three-quarters on, warm neutral expression. Soft even beauty lighting with a gentle falloff, no harsh shadows. Plain muted background in soft sage. Shot on 85mm lens at f/2, natural skin texture retained. Framed with the head in the upper centre and space below the chin. Clean, professional, approachable.`,
    negative: "harsh shadows, heavy retouching, plastic skin, busy background, sunglasses",
    description:
      "A headshot prompt that stays recognisable at 40px. Consistent lighting and background mean you can regenerate variations that still read as the same person and brand.",
    tips: `<p>"Natural skin texture retained" is doing real work — without it models over-smooth faces into plastic, which reads as fake instantly.</p><p>Test it as a 40px circle. If the face is unreadable at avatar size, the framing is too wide.</p>`,
    kind: "IMAGE",
    outputType: "AVATAR",
    difficulty: "BEGINNER",
    aspectRatio: "1:1",
    parameters: "--ar 1:1 --style raw",
    modelSlug: "nano-banana",
    categorySlug: "ai-for-creators",
    tags: ["avatar", "headshot", "profile", "branding"],
  },
  {
    title: "Video script hook that earns the next ten seconds",
    slug: "video-script-hook",
    body: `You are a short-form video scriptwriter. Write 5 alternative opening hooks for a video about [TOPIC], aimed at [AUDIENCE].

Rules:
- Each hook is ONE sentence, maximum 12 words.
- Each must be speakable out loud in under 3 seconds.
- No questions that invite "no" as an answer.
- No "In this video I'll show you" or any variation.
- Vary the angle: one contrarian, one specific-number, one mistake-based, one curiosity-gap, one direct-promise.

Return only the 5 hooks as a numbered list, no commentary.`,
    description:
      "A text prompt that produces usable hooks instead of generic filler. The constraints do the work — especially the word limit and the banned phrases.",
    tips: `<p>The banned-phrases list matters more than anything else here. Without it every model opens with "In this video" — which is precisely the phrasing that loses viewers.</p><p>Asking for five <em>different angles</em> rather than five hooks stops the model producing five rewordings of the same idea.</p>`,
    kind: "TEXT",
    outputType: "REEL_SHORT",
    difficulty: "BEGINNER",
    modelSlug: "chatgpt-image",
    categorySlug: "ai-writing",
    tags: ["script", "hook", "copywriting", "shorts"],
    toolSlugs: ["chatgpt", "claude"],
  },
  {
    title: "Event poster with a real typographic grid",
    slug: "event-poster-swiss-grid",
    body: `Swiss-style event poster. Bold geometric composition on a warm off-white background, strict grid alignment, large areas of flat colour in muted coral and deep ink. One dominant abstract shape anchored to the left margin. Generous white space in the lower third reserved for event details. Print-inspired, high contrast, minimal, risograph texture with slight colour misregistration.`,
    negative: "text, photorealism, gradients, drop shadows, clutter",
    description:
      "A poster background built on an actual grid, with the lower third deliberately left clear for date, venue and ticket details.",
    tips: `<p>"Slight colour misregistration" is what gives it the printed riso feel — flat digital colour looks sterile by comparison.</p><p>Generate the background here, set the type in Figma. Every poster lives or dies on typography, and that is still the one thing to do by hand.</p>`,
    kind: "IMAGE",
    outputType: "POSTER",
    difficulty: "INTERMEDIATE",
    aspectRatio: "2:3",
    parameters: "--ar 2:3",
    modelSlug: "midjourney",
    categorySlug: "ai-image-design",
    tags: ["poster", "swiss", "print", "riso"],
    toolSlugs: ["figma"],
  },
];

export interface SeedTool {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  pricing: PricingTier;
  priceNote?: string;
  officialUrl: string;
  bestFor: string;
  pros: string[];
  cons: string[];
  categorySlug: string;
  tags: string[];
  featured?: boolean;
}

export const TOOLS: SeedTool[] = [
  {
    name: "Midjourney",
    slug: "midjourney",
    tagline: "The most opinionated image model, and the best-looking by default",
    description: `<p>Midjourney produces the most <em>styled</em> images of any mainstream generator. Where other models aim for literal accuracy, Midjourney aims for something that looks art-directed — which is usually what you want for thumbnails, posters and social content.</p><p>The trade-off is control. Long descriptive prompts often produce worse results than short confident ones, and getting a specific composition takes parameter tuning rather than more words.</p><p>It is the default recommendation for creators who care how the image looks more than whether it matches a spec exactly.</p>`,
    pricing: "PAID",
    priceNote: "Subscription only — no meaningful free tier.",
    officialUrl: "https://www.midjourney.com",
    bestFor: "Thumbnails, posters and social visuals where style matters more than literal accuracy",
    pros: [
      "Best-looking default output of any image model",
      "Excellent at lighting, mood and composition",
      "Strong style consistency across a series",
      "Fast iteration with variations and remixing",
    ],
    cons: [
      "No free tier",
      "Unreliable at rendering legible text in images",
      "Less literal prompt-following than Flux or ChatGPT Image",
    ],
    categorySlug: "ai-image-design",
    tags: ["image", "midjourney", "design"],
    featured: true,
  },
  {
    name: "ChatGPT",
    slug: "chatgpt",
    tagline: "The generalist — strongest for text, and the best image model for typography",
    description: `<p>ChatGPT covers scripts, captions, hooks and ideation, and its image generation is the most reliable mainstream option when the image needs to contain <strong>readable text</strong> — titles, labels, packaging.</p><p>It is also the easiest to iterate with conversationally: describe what is wrong and it adjusts, rather than requiring you to re-prompt from scratch.</p>`,
    pricing: "FREEMIUM",
    priceNote: "Usable free tier; paid plan raises limits and unlocks the better models.",
    officialUrl: "https://chatgpt.com",
    bestFor: "Scripts and captions, plus images that need legible text",
    pros: [
      "Best-in-class at rendering text inside images",
      "Conversational iteration instead of re-prompting",
      "One tool covering writing, ideation and images",
      "Genuinely usable free tier",
    ],
    cons: [
      "Image style is more generic than Midjourney's",
      "Default writing voice needs firm prompting to not sound like AI",
      "Rate limits on the free tier bite quickly",
    ],
    categorySlug: "ai-writing",
    tags: ["text", "image", "openai", "writing"],
    featured: true,
  },
  {
    name: "Claude",
    slug: "claude",
    tagline: "The best writing partner when the copy has to sound human",
    description: `<p>Claude is the strongest option for long-form and voice-sensitive writing — scripts, newsletters, captions with an actual personality. It holds a brief across a long conversation better than the alternatives and is markedly less prone to the flat, hedge-everything register that makes AI copy obvious.</p><p>No image generation, so it sits alongside an image model rather than replacing one.</p>`,
    pricing: "FREEMIUM",
    priceNote: "Free tier available; paid plans raise usage limits.",
    officialUrl: "https://claude.ai",
    bestFor: "Scripts, newsletters and any copy where voice matters",
    pros: [
      "Most natural writing voice of the major assistants",
      "Holds context and a brief over long sessions",
      "Strong at editing and critiquing your own drafts",
    ],
    cons: ["No image or video generation", "Smaller ecosystem of integrations"],
    categorySlug: "ai-writing",
    tags: ["text", "writing", "anthropic"],
  },
  {
    name: "Sora",
    slug: "sora",
    tagline: "Text-to-video with genuine camera language",
    description: `<p>Sora generates longer shots with coherent motion, and it responds to actual cinematography terms — push in, dolly, rack focus. Prompts work best written like a shot list rather than a description.</p><p>As with every video model, expect to generate several takes per usable clip. Budget for that in your workflow rather than expecting first-try results.</p>`,
    pricing: "PAID",
    priceNote: "Bundled with a paid subscription rather than sold standalone.",
    officialUrl: "https://openai.com/sora",
    bestFor: "Cinematic b-roll and hook shots for short-form video",
    pros: [
      "Understands camera moves and shot language",
      "Longer coherent takes than most competitors",
      "Strong physical realism in motion",
    ],
    cons: [
      "Needs multiple takes per usable clip",
      "Limited fine control over the final frame",
      "No free access",
    ],
    categorySlug: "ai-video-audio",
    tags: ["video", "openai", "cinematic"],
    featured: true,
  },
  {
    name: "Runway",
    slug: "runway",
    tagline: "A video editor with generation built in",
    description: `<p>Runway is the pick when you need to <em>finish a video</em>, not just generate clips. Alongside generation it has background removal, motion tracking, inpainting and a real timeline — so a whole edit can happen in one place.</p><p>Raw generation quality trails Sora and Veo, but the surrounding toolset often matters more in practice.</p>`,
    pricing: "FREEMIUM",
    priceNote: "Limited free credits; paid plans for meaningful volume.",
    officialUrl: "https://runwayml.com",
    bestFor: "Finishing an edit rather than only generating clips",
    pros: [
      "Full editing suite, not just a generator",
      "Excellent background removal and motion tracking",
      "Image-to-video gives more control than text-to-video",
    ],
    cons: [
      "Generation quality behind the newest video models",
      "Credits disappear quickly while experimenting",
    ],
    categorySlug: "ai-video-audio",
    tags: ["video", "editing", "runway"],
  },
  {
    name: "Canva",
    slug: "canva",
    tagline: "Where AI output becomes a finished, on-brand asset",
    description: `<p>Nearly every prompt on this site produces a raw image that still needs text, cropping and brand treatment. Canva is where that happens. Its own AI features are decent, but its real value is being the fastest way to turn a generated image into a posted asset with correct dimensions and readable typography.</p><p>Brand kits keep fonts and colours locked across everything you make, which matters more than any individual AI feature.</p>`,
    pricing: "FREEMIUM",
    priceNote: "Generous free tier; paid unlocks brand kits and background removal.",
    officialUrl: "https://www.canva.com",
    bestFor: "Adding text and brand treatment to AI-generated images",
    pros: [
      "Fastest path from raw image to posted asset",
      "Correct preset sizes for every platform",
      "Brand kits keep a series consistent",
      "Very capable free tier",
    ],
    cons: [
      "Templates are recognisable if used unmodified",
      "Less precise than Figma for real layout work",
    ],
    categorySlug: "ai-for-creators",
    tags: ["design", "editing", "branding"],
    featured: true,
  },
  {
    name: "CapCut",
    slug: "capcut",
    tagline: "Short-form video editing with auto-captions that actually work",
    description: `<p>CapCut is the default editor for Reels, Shorts and TikToks — auto-captions, beat-synced cuts, and platform-correct export presets. Its auto-caption accuracy and styling are the single biggest time-saver for short-form creators.</p><p>Pair it with a generated hook shot: generate the clip elsewhere, cut and caption here.</p>`,
    pricing: "FREEMIUM",
    priceNote: "Most core editing is free; some effects and assets are paid.",
    officialUrl: "https://www.capcut.com",
    bestFor: "Cutting and captioning vertical video",
    pros: [
      "Auto-captions are fast and accurate",
      "Built for vertical short-form by default",
      "Most editing features free",
    ],
    cons: [
      "Effects are heavily used, so they read as trendy fast",
      "Less suited to long-form editing",
    ],
    categorySlug: "ai-video-audio",
    tags: ["video", "editing", "captions", "shorts"],
  },
  {
    name: "ElevenLabs",
    slug: "elevenlabs",
    tagline: "The most convincing AI voiceover available",
    description: `<p>ElevenLabs produces voiceovers with believable intonation rather than the flat cadence that gives most synthetic speech away. For faceless channels, narration and dubbing it is clearly ahead of the alternatives.</p><p>Treat voice cloning carefully — clone your own voice, or one you have explicit permission to use.</p>`,
    pricing: "FREEMIUM",
    priceNote: "Free monthly character allowance; paid tiers scale it up.",
    officialUrl: "https://elevenlabs.io",
    bestFor: "Voiceover for faceless channels and narration",
    pros: [
      "Most natural intonation of any TTS",
      "Wide language and accent coverage",
      "Fast enough for daily publishing",
    ],
    cons: [
      "Free character allowance runs out quickly",
      "Voice cloning carries real consent and legal considerations",
    ],
    categorySlug: "ai-video-audio",
    tags: ["audio", "voiceover", "tts"],
  },
  {
    name: "Figma",
    slug: "figma",
    tagline: "Precise layout when Canva is not exact enough",
    description: `<p>When a layout needs real typographic control — posters, thumbnails with tight type, brand systems — Figma is the tool. Steeper to learn than Canva, but it is the difference between "made from a template" and "designed".</p><p>Its free tier is genuinely sufficient for solo creator work.</p>`,
    pricing: "FREEMIUM",
    priceNote: "Free tier covers solo use comfortably.",
    officialUrl: "https://www.figma.com",
    bestFor: "Precise typography and reusable design systems",
    pros: [
      "Exact control over type and layout",
      "Components make a series trivially repeatable",
      "Strong free tier",
      "Huge plugin and community ecosystem",
    ],
    cons: ["Steeper learning curve than Canva", "Overkill for a quick single post"],
    categorySlug: "ai-for-creators",
    tags: ["design", "layout", "typography"],
  },
  {
    name: "Descript",
    slug: "descript",
    tagline: "Edit video by editing the transcript",
    description: `<p>Descript transcribes your footage and lets you edit the video by editing text — delete a sentence in the transcript and the corresponding video disappears. Filler-word removal alone justifies it for talking-head content.</p><p>Best suited to spoken-word video: podcasts, tutorials, pieces to camera.</p>`,
    pricing: "FREEMIUM",
    priceNote: "Free tier with limited transcription hours.",
    officialUrl: "https://www.descript.com",
    bestFor: "Talking-head video, podcasts and tutorials",
    pros: [
      "Transcript-based editing is dramatically faster for spoken content",
      "Automatic filler-word removal",
      "Good screen recording built in",
    ],
    cons: [
      "Not suited to heavily visual or motion-driven edits",
      "Transcription hours are limited on the free tier",
    ],
    categorySlug: "ai-productivity-coding",
    tags: ["video", "editing", "transcription", "podcast"],
  },
];

export interface SeedArticle {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  content: string;
  kind: ArticleKind;
  difficulty?: Difficulty;
  categorySlug: string;
  tags: string[];
  featured?: boolean;
  steps?: { title: string; body: string; tip?: string }[];
  promptSlugs?: string[];
  toolSlugs?: string[];
}

export const ARTICLES: SeedArticle[] = [
  {
    title: "How to make a YouTube thumbnail with AI that actually gets clicked",
    slug: "how-to-make-youtube-thumbnail-with-ai",
    subtitle: "A repeatable five-step workflow, from prompt to uploaded file",
    excerpt:
      "Most AI thumbnails fail for the same three reasons: no negative space, unreadable at small sizes, and text baked into the generation. Here is the workflow that avoids all three.",
    content: `<p>A thumbnail has one job: be legible and interesting at roughly 120 pixels wide. Almost every AI-generated thumbnail fails because it is judged at full size, where a busy, centred, detailed image looks great — and then disappears in the feed.</p><p>This workflow fixes that by deciding the composition before generating anything, and by keeping text out of the image model entirely.</p>`,
    kind: "TUTORIAL",
    difficulty: "BEGINNER",
    categorySlug: "ai-image-design",
    tags: ["thumbnail", "youtube", "workflow", "tutorial"],
    featured: true,
    steps: [
      {
        title: "Decide where the text goes before you generate",
        body: "<p>Pick the side your title will occupy — usually the left half. Every prompt from here on has to protect that space. Deciding this after generating is what forces the endless recrop-and-regenerate loop.</p>",
        tip: "Write your actual title first, even roughly. A seven-word title needs far more room than a two-word one.",
      },
      {
        title: "Generate the subject with deliberate negative space",
        body: "<p>Use a prompt that explicitly places the subject in one third and describes the rest as clean negative space. State the lighting — rim lighting is what separates a subject from its background at small sizes.</p><p>Generate four options and reject anything centred, no matter how good it looks.</p>",
        tip: "If every result comes back centred, your composition clause is buried too deep. Move it earlier in the prompt.",
      },
      {
        title: "Check it at 10% before going further",
        body: "<p>Zoom the image to roughly 120px wide. You should still be able to read the subject's expression and see clear separation from the background. If you cannot, no amount of text will save it — regenerate.</p>",
        tip: "This single check eliminates most failed thumbnails, and it takes five seconds.",
      },
      {
        title: "Add the text in a real design tool",
        body: "<p>Take the image into Canva or Figma and set the title there. Use a heavy sans at a large size, with a subtle outline or shadow so it holds against any background.</p><p>Do not ask the image model to render your title — even the best models still garble text, and you want crisp vector type.</p>",
        tip: "Three to five words maximum. The thumbnail and the video title should complement each other, not repeat.",
      },
      {
        title: "Export at 1280×720 and sanity-check in context",
        body: "<p>Export as 1280×720 JPG or PNG under 2MB. Before uploading, view it beside your other thumbnails — a series should look like a series while staying distinguishable.</p>",
        tip: "Keep the lighting description identical across a series. That is what makes your channel visually recognisable.",
      },
    ],
    promptSlugs: ["youtube-thumbnail-reacting-face"],
    toolSlugs: ["midjourney", "canva", "figma"],
  },
  {
    title: "Making an Instagram carousel where all ten slides match",
    slug: "instagram-carousel-consistent-slides",
    subtitle: "The freeze-everything-but-the-subject technique",
    excerpt:
      "Generating ten slides individually gives you ten unrelated images. The fix is a base prompt where only one noun ever changes.",
    content: `<p>Carousels live or die on visual consistency. If slide four has different lighting from slide three, the set reads as sloppy — and the swipe-through rate that Instagram rewards drops with it.</p><p>The technique is simple and slightly counterintuitive: write one prompt, then resist the urge to improve it between slides.</p>`,
    kind: "TUTORIAL",
    difficulty: "INTERMEDIATE",
    categorySlug: "ai-image-design",
    tags: ["instagram", "carousel", "consistency", "tutorial"],
    steps: [
      {
        title: "Write one base prompt and lock it",
        body: "<p>Fix the background, lighting direction, colour palette, lens and camera angle. These clauses must be byte-identical on every slide — copy and paste rather than retyping.</p>",
        tip: "Keep the base prompt in a note. You will reuse it for months, and it becomes part of your visual identity.",
      },
      {
        title: "Change only the subject noun per slide",
        body: "<p>Swap the subject and nothing else. Not the lighting, not the adjectives, not the order of clauses. Any other edit reintroduces drift.</p>",
        tip: "Resist improving the prompt mid-set. Save improvements for the next carousel.",
      },
      {
        title: "Generate the whole set in one session",
        body: "<p>Models drift between sessions even with identical prompts. Generate all slides back to back, and if you need to redo one later, redo the whole set.</p>",
      },
      {
        title: "Assemble and add text in Canva",
        body: "<p>Bring all slides in at 1080×1350, add your copy with a locked brand kit, and export as a set. Check the first slide separately — it does most of the work of stopping the scroll.</p>",
        tip: "Instagram crops carousels differently in feed versus the profile grid. Keep important content away from the edges.",
      },
    ],
    promptSlugs: ["instagram-carousel-consistent-system"],
    toolSlugs: ["nano-banana", "canva"],
  },
  {
    title: "A reel hook that survives the first two seconds",
    slug: "ai-reel-hook-first-two-seconds",
    subtitle: "Generating an opener built for the scroll, not for a showreel",
    excerpt:
      "Most AI video prompts produce slow, drifting, beautiful footage — which is exactly what loses a viewer in the first second. Here is how to prompt for motion that holds.",
    content: `<p>Short-form video is decided in the first two seconds. Video models, left to their own devices, produce slow atmospheric drift: gorgeous in a showreel, fatal in a feed.</p><p>Fixing it means prompting for camera movement and duration explicitly, and treating the first frame as seriously as a thumbnail.</p>`,
    kind: "TUTORIAL",
    difficulty: "INTERMEDIATE",
    categorySlug: "ai-video-audio",
    tags: ["reels", "shorts", "video", "hook", "tutorial"],
    featured: true,
    steps: [
      {
        title: "Prompt the camera move, not just the scene",
        body: "<p>Name the movement and how it resolves: <em>camera pushes in fast, then snaps to a stop</em>. Without an explicit move you get a slow drift by default.</p>",
        tip: "Also state the duration. 'Duration 4 seconds, one continuous take' meaningfully constrains the result.",
      },
      {
        title: "Frame for the platform UI, not for the frame",
        body: "<p>Keep the subject's head in the upper third. The lower quarter is covered by captions, the username and the interface on every platform — anything important there is invisible.</p>",
      },
      {
        title: "Generate several takes and expect to discard most",
        body: "<p>Video models are far less consistent than image models. Three to five takes per usable clip is normal. Judge each on whether the motion resolves cleanly, not on individual frames.</p>",
        tip: "Save the takes you reject. They often work as b-roll later.",
      },
      {
        title: "Cut and caption in CapCut",
        body: "<p>Bring the clip in, trim to the exact beat where the motion resolves, and add auto-captions. Trim tighter than feels comfortable — most hooks are improved by losing their first half-second.</p>",
      },
    ],
    promptSlugs: ["reel-opener-hook-shot"],
    toolSlugs: ["sora", "capcut", "runway"],
  },
];
