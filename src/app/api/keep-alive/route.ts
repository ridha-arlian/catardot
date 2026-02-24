// src/app/api/cron/keep-alive/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      success: true,
      message: "Supabase is alive!",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[keep-alive] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to ping database" },
      { status: 500 }
    );
  }
}