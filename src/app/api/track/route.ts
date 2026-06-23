import { NextRequest, NextResponse } from "next/server";
import { takipTuru } from "@/lib/tracker";

// Vercel/Supabase Cron'un çağırdığı route. CRON_SECRET ile korunur.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ hata: "yetkisiz" }, { status: 401 });
  }

  try {
    const sonuc = await takipTuru();
    return NextResponse.json({ ok: true, ...sonuc });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "hata";
    return NextResponse.json({ hata: msg }, { status: 500 });
  }
}
