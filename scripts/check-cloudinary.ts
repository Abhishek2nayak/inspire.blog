/**
 * Verifies Cloudinary credentials without uploading anything.
 *
 *   npm run check:cloudinary
 *
 * Useful because an upload failure in the browser gives no indication of
 * which of the three variables is wrong.
 */
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";
import path from "node:path";

/**
 * Next loads .env automatically; a bare tsx script does not. Without this the
 * check reports every variable as empty, which is a misleading diagnosis.
 */
function loadEnv() {
  const file = path.join(process.cwd(), ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    if (process.env[key]) continue; // real env wins over the file
    process.env[key] = m[2].replace(/^["']|["']$/g, "").trim();
  }
}

async function main() {
  loadEnv();

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log("\nConfig found in .env:");
  console.log("  CLOUDINARY_CLOUD_NAME :", cloudName || "(empty)");
  console.log("  CLOUDINARY_API_KEY    :", apiKey ? `${apiKey.slice(0, 4)}… (${apiKey.length} chars)` : "(empty)");
  console.log("  CLOUDINARY_API_SECRET :", apiSecret ? `set (${apiSecret.length} chars)` : "(empty)");

  if (!cloudName || !apiKey || !apiSecret) {
    console.log("\n  ✗ One or more values are empty. Fill them in .env.\n");
    process.exit(1);
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

  try {
    // Cheapest authenticated call — confirms all three values together.
    const res = await cloudinary.api.ping();
    console.log(`\n  ✓ Cloudinary OK (${res.status}). Uploads will work.\n`);
  } catch (e) {
    const err = e as { message?: string; error?: { message?: string }; http_code?: number };
    const msg = err?.error?.message ?? err?.message ?? String(e);
    console.log(`\n  ✗ Cloudinary rejected the credentials: ${msg}`);

    if (/invalid cloud_name|cloud_name mismatch/i.test(msg)) {
      console.log(
        `\n  The cloud name "${cloudName}" does not match this API key's account.\n` +
          "  (Your key and secret look valid — only the cloud name is wrong.)\n" +
          "  Open https://console.cloudinary.com — the Cloud name is shown in the\n" +
          "  dashboard header (and under Settings → Product Environments). It is\n" +
          "  assigned at signup and is usually NOT your brand name.\n"
      );
    } else if (err?.http_code === 401) {
      console.log(
        "\n  The cloud name resolved but the key/secret were rejected. Make sure\n" +
          "  all three values come from the SAME product environment.\n"
      );
    }
    process.exit(1);
  }
}

main();
