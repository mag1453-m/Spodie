import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Tarayıcı + sunucu (okuma) için anon client.
 * Sadece RLS ile izin verilen şeyleri yapar (dinlemeleri okumak gibi).
 */
export function createBrowserSupabase() {
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı değil (.env.local)."
    );
  }
  return createClient(url, anonKey);
}

/**
 * SADECE sunucu tarafı. service_role anahtarıyla RLS'i bypass eder:
 * token yazma, cron job, dinleme kaydetme bunu kullanır.
 * Bu fonksiyonu asla bir Client Component'ten import etme.
 */
export function createServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tanımlı değil (.env.local)."
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
