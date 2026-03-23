import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const interests: string[] = body.interests ?? [];

    if (!Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one interest" },
        { status: 400 }
      );
    }

    // Remove all existing user interests
    await prisma.userInterest.deleteMany({ where: { userId } });

    // Upsert each interest and link to user
    for (const name of interests) {
      // Find or create the interest (handle slug field from old schema gracefully)
      let interest = await prisma.interest.findFirst({ where: { name } });

      if (!interest) {
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          interest = await prisma.interest.create({ data: { name, slug } as any });
        } catch {
          // If creation fails (e.g. slug conflict), try finding again
          interest = await prisma.interest.findFirst({ where: { name } });
          if (!interest) continue;
        }
      }

      // Create user-interest link (ignore if already exists)
      await prisma.userInterest
        .create({ data: { userId, interestId: interest.id } })
        .catch(() => {
          /* ignore duplicate */
        });
    }

    // Mark user as onboarded
    await prisma.user.update({
      where: { id: userId },
      data: { onboarded: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ONBOARDING_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to save interests. Please try again." },
      { status: 500 }
    );
  }
}
