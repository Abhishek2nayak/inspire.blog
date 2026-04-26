// app/api/test-cron/route.ts
import { publishScheduledPosts } from "@/app/api/crons/post";

export async function GET() {
  await publishScheduledPosts();
  return Response.json({ ok: true });
}
