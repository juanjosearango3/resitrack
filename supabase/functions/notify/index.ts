// ResiTrack · envía los avisos push pendientes.
// pg_cron la invoca cada 10 minutos con la cabecera x-rt-secret.
// Ninguna clave está escrita aquí: se generan y se guardan en la base
// (tabla app_secrets, solo accesible con la service role).
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const SITE = Deno.env.get("RT_SITE_URL") ?? "https://resitrackjj.vercel.app";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function secret(key: string): Promise<string | null> {
  const { data } = await sb.from("app_secrets").select("value").eq("key", key).maybeSingle();
  return data?.value ?? null;
}

// Genera el par VAPID la primera vez y lo deja guardado.
async function vapid(): Promise<{ publicKey: string; privateKey: string }> {
  const priv = await secret("vapid_private");
  const { data: pubRow } = await sb.from("meta").select("value").eq("key", "vapid_public").maybeSingle();
  const pub = pubRow?.value as string | undefined;
  if (priv && pub) return { publicKey: pub, privateKey: priv };

  const keys = webpush.generateVAPIDKeys();
  await sb.from("app_secrets").upsert({ key: "vapid_private", value: keys.privateKey });
  await sb.from("meta").upsert({ key: "vapid_public", value: keys.publicKey });
  return keys;
}

Deno.serve(async (req) => {
  const expected = await secret("notify_secret");
  if (!expected || req.headers.get("x-rt-secret") !== expected) {
    return json({ error: "unauthorized" }, 401);
  }

  const keys = await vapid();
  webpush.setVapidDetails(SITE, keys.publicKey, keys.privateKey);

  // Suscripciones por usuario, cargadas una sola vez.
  const subsCache = new Map<string, any[]>();
  async function subsOf(uids: string[]) {
    const missing = uids.filter((u) => !subsCache.has(u));
    if (missing.length) {
      const { data } = await sb.from("push_subs").select("*").in("user_id", missing);
      for (const u of missing) subsCache.set(u, (data ?? []).filter((s: any) => s.user_id === u));
    }
  }
  let sent = 0;
  const gone = new Set<string>();
  async function push(uid: string, payload: string) {
    for (const s of subsCache.get(uid) ?? []) {
      if (gone.has(s.endpoint)) continue;
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
        sent++;
      } catch (e: any) {
        if (e?.statusCode === 404 || e?.statusCode === 410) gone.add(s.endpoint);
      }
    }
  }

  // 1) Avisos personales: retos (llegan uno por uno, con su propia etiqueta).
  const since = new Date(Date.now() - 2 * 864e5).toISOString();
  const { data: notices } = await sb.from("user_notices").select("*")
    .is("sent_at", null).gte("created_at", since).order("created_at").limit(200);
  if (notices?.length) {
    await subsOf([...new Set(notices.map((n: any) => n.user_id))]);
    for (const n of notices) {
      await push(n.user_id, JSON.stringify({
        title: n.title, body: n.body || "", url: SITE + (n.kind === "reporte" || n.kind === "racha" ? "/?tab=study" : "/?tab=group"), tag: (n.kind === "reporte" ? "reporte-" : "reto-") + (n.ref ?? n.id),
      }));
    }
    await sb.from("user_notices").update({ sent_at: new Date().toISOString() }).in("id", notices.map((n: any) => n.id));
  }

  // 2) Novedades de convocatorias.
  const { data: pending, error } = await sb.rpc("pending_notifications");
  if (error) return json({ error: error.message }, 500);

  const byUser = new Map<string, any[]>();
  for (const p of pending ?? []) {
    if (!byUser.has(p.user_id)) byUser.set(p.user_id, []);
    byUser.get(p.user_id)!.push(p);
  }
  const done: { user_id: string; change_id: number }[] = [];
  if (byUser.size) {
    await subsOf([...byUser.keys()]);
    for (const [uid, items] of byUser) {
      const title = items.length === 1 ? items[0].title : `${items.length} novedades en ResiTrack`;
      const body = items.length === 1
        ? (items[0].body || "Toca para ver el detalle.")
        : items.slice(0, 3).map((i: any) => i.title).join(" · ");
      await push(uid, JSON.stringify({ title, body, url: SITE + "/?tab=mine", tag: "resitrack" }));
      // Se marca aunque no tenga dispositivo: la novedad ya queda en su feed.
      for (const it of items) done.push({ user_id: uid, change_id: it.change_id });
    }
    await sb.from("notified").upsert(done, { onConflict: "user_id,change_id" });
  }

  if (gone.size) await sb.from("push_subs").delete().in("endpoint", [...gone]);

  return json({ sent, notices: notices?.length ?? 0, users: byUser.size, marked: done.length, dropped: gone.size });
});
