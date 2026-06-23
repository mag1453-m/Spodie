import { NextResponse } from "next/server";
import { takipTuru } from "@/lib/tracker";

// Site açıkken tarayıcının çağırdığı hafif tetikleyici (CRON_SECRET istemez).
// /api/track ile aynı işi yapar; site açık olduğu sürece takip otomatik çalışır.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sonuc = await takipTuru();
    return NextResponse.json({ ok: true, sayildi: sonuc.sayildi });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "hata";
    return NextResponse.json({ hata: msg }, { status: 500 });
  }
}
