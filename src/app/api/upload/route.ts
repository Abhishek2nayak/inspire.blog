import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import cloudinary from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    // Any signed-in user, because sellers upload their own example images.
    // That is a deliberate reopening of an abuse vector I had closed when
    // this was admin-only: the mitigations are the 5 MB cap, the type
    // allowlist, and the fact that nothing an uploader submits goes live
    // without admin approval. If storage abuse shows up, gate this behind a
    // per-user daily quota rather than re-restricting it to admins.
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Sign in to upload" }, { status: 401 });
    }

    // Fail with a useful message rather than a 500 from the Cloudinary SDK.
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        {
          error:
            "Image upload isn't configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.",
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, WebP and SVG are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size exceeds 5 MB limit." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "makeframe",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    return NextResponse.json(
      {
        url: result.secure_url,
        filename: result.public_id,
        // Returned so PromptExample can store them: next/image needs
        // dimensions to reserve space (no layout shift), and ImageObject
        // JSON-LD needs them for image rich results.
        width: result.width,
        height: result.height,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);

    /**
     * Surface WHY it failed instead of a flat "Failed to upload file."
     *
     * A misconfigured cloud name previously produced a generic 500, and
     * finding the real cause meant digging through server logs for a
     * one-line typo. Cloudinary's own message is operator-facing and safe
     * to show — the uploader is a signed-in user, not the public.
     */
    const c = error as { message?: string; http_code?: number };
    const raw = c?.message ?? "";

    if (/invalid cloud_name|cloud_name mismatch/i.test(raw)) {
      return NextResponse.json(
        {
          error:
            `Cloudinary rejected the cloud name "${process.env.CLOUDINARY_CLOUD_NAME}". ` +
            "Copy the exact Cloud name from your Cloudinary dashboard into " +
            "CLOUDINARY_CLOUD_NAME — it's assigned at signup and is usually not your brand name.",
        },
        { status: 500 }
      );
    }

    if (c?.http_code === 401 || /api_key|signature|unauthor/i.test(raw)) {
      return NextResponse.json(
        {
          error:
            "Cloudinary rejected the credentials. Check CLOUDINARY_API_KEY and " +
            "CLOUDINARY_API_SECRET match the same product environment as your cloud name.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: raw ? `Upload failed: ${raw}` : "Upload failed." },
      { status: 500 }
    );
  }
}
