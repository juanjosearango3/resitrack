import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

/* ---------- configuración ---------- */
const SUPABASE_URL = "https://foujwctiqyykhnmqbdkh.supabase.co";
const SUPABASE_KEY = "sb_publishable_YgRfcwy6bsWAyUhKvCEmBg_qwjqBGxs";

const SB = createClient(SUPABASE_URL, SUPABASE_KEY);
const { DATA, OTHERS, ALIAS } = window.RT;

/* ---------- utilidades ---------- */
const STAGES = [["interes","Me interesa"],["inscrito","Inscrito"],["examen","Presenté examen"],["entrevista","Entrevista"],["admitido","Admitido"]];
const COLORS = ["var(--drop)","var(--tbd)","var(--warn)","var(--ok)","var(--off)","var(--lead)","var(--muted)"];
const MES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim();
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const D = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
const fmt = s => { const d = D(s); return d.getDate()+" "+MES[d.getMonth()]+" "+d.getFullYear(); };
const fmtS = s => { const d = D(s); return d.getDate()+" "+MES[d.getMonth()]; };
const days = s => Math.round((D(s)-today)/864e5);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const OF = u => u.oferta || u.specs;
const CI = u => u.cities || [u.city];
const BY = Object.fromEntries(DATA.map(u => [u.id, u]));
const $ = id => document.getElementById(id);
const svgI = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  pin: svgI('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
  bank: svgI('<path d="M3.5 9 12 4l8.5 5"/><path d="M5.5 10v7M10 10v7M14 10v7M18.5 10v7M3.5 20h17"/>'),
  cap: svgI('<path d="m2.5 9 9.5-4.5L21.5 9 12 13.5z"/><path d="M6.5 11v4.5c1.5 1.5 3.4 2.2 5.5 2.2s4-.7 5.5-2.2V11"/>'),
  cal: svgI('<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>'),
  doc: svgI('<path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8z"/><path d="M14 3.5V8h4.5M9 13h6M9 16.5h4"/>'),
  bell: svgI('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>'),
  chart: svgI('<path d="M5 20V12M10 20V6M15 20v-9M20 20V9"/>'),
  chev: svgI('<path d="m9 6 6 6-6 6"/>'),
  flag: svgI('<path d="M5 21V4.5M5 4.5h11l-2 4 2 4H5"/>'),
  fire: svgI('<path d="M12 21c-3.9 0-6.5-2.6-6.5-6 0-3.5 2.6-5.2 3.4-8.4.2-.8 1.2-1 1.6-.3 1 1.7 1.3 3.2 1.2 4.6 1-.4 1.8-1.4 2.1-2.6.2-.7 1.1-.9 1.5-.2 1.2 1.9 3.2 3.9 3.2 6.9 0 3.4-2.6 6-6.5 6z"/>'),
  target: svgI('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'),
  steth: svgI('<path d="M6 3.5v5a4 4 0 0 0 8 0v-5"/><path d="M10 12.5v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="10.5" r="2"/>'),
  lock: svgI('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
  info: svgI('<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.2"/>'),
  hourglass: svgI('<path d="M7 3.5h10M7 20.5h10M8 3.5c0 4.5 8 4.5 8 8.5s-8 4-8 8.5M16 3.5c0 4.5-8 4.5-8 8.5"/>'),
  copy: svgI('<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>'),
  share: svgI('<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1"/>'),
  userplus: svgI('<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5M19 8v6M16 11h6"/>'),
  users: svgI('<circle cx="9" cy="8.5" r="3"/><circle cx="17" cy="9.5" r="2.5"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M15 14.2c2.5-.4 4.6 1 5.2 4.3"/>'),
  trophy: svgI('<path d="M8 4.5h8v5a4 4 0 0 1-8 0z"/><path d="M8 6.5H4.5c0 3 1.5 4.5 3.7 4.8M16 6.5h3.5c0 3-1.5 4.5-3.7 4.8M12 13.5v3.5M8.5 20.5h7M9.5 17h5v3.5h-5z"/>'),
  swords: svgI('<path d="M14.5 4.5h5v5L9 20l-3-3zM9.5 4.5h-5v5L15 20l3-3"/>'),
  stopwatch: svgI('<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5V13.5l2.5 2M10 2.5h4M18.5 6l1.5-1.5"/>'),
  spin: svgI('<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v4.5h-4.5"/>'),
  live: svgI('<circle cx="12" cy="12" r="2.5"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"/>'),
};
const rel = d => d>1 ? "en "+d+" días" : d===1 ? "mañana" : d===0 ? "hoy" : "en curso";

function status(u){
  if (u.tbd || !u.insc) return {k:"tbd", t:"Por confirmar", c:"s-tbd", o:1};
  if (days(u.insc) >= 0)  return {k:"open", t:"Inscripciones abiertas", c:"s-open", o:0};
  if (u.final && days(u.final) >= 0) return {k:"proc", t:"En proceso", c:"s-proc", o:2};
  return {k:"off", t:"Cerrada", c:"s-off", o:3};
}
function nextEvent(u){ for (const e of u.tl) if (days(e[2]||e[0]) >= 0) return e; return null; }
const sortU = (a,b) => {
  const sa = status(a), sb = status(b);
  if (sa.o !== sb.o) return sa.o - sb.o;
  const na = nextEvent(a), nb = nextEvent(b);
  return (na ? D(na[0]) : 9e15) - (nb ? D(nb[0]) : 9e15);
};
function toast(msg){
  const t = $("toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3200);
}

/* ---------- estado ---------- */
let ME = null;            // auth user
let PROFILE = null;       // mi fila de profiles
let PEOPLE = {};          // user_id -> profile (yo + gente de mis grupos)
let GROUPS = [];          // mis grupos
let MEMBERS = [];         // filas de group_members visibles
let FOLLOWS = [];         // mis follows + los de mi grupo
let FEED = [];            // cambios recientes
let tab = "all";
let statusFilter = "";
// Práctica (repaso, áreas, simulacro), liga de grupo y quiz en vivo
let PRAC = null;          // { screen, mode, title, qs, picks, uni, startedAt, endsAt, result }
let REV = { due_now: 0, upcoming: 0, mastered: 0, next_due: null };
let AREA_STATS = [], BANK = 0, SIM_HIST = [], LEAGUE = {};
let STUDY_VIEW = null;    // null = menú de Estudiar; "daily" = preguntas del día
let LIVE = null;          // { room, code, st, endsAt, busy }

const myFollow = id => FOLLOWS.find(f => f.uni_id === id && f.user_id === ME?.id);
const aliasOf = id => PEOPLE[id]?.alias || "Alguien";
const initials = s => (s||"?").trim().split(/\s+/).slice(0,2).map(w => w[0]).join("").toUpperCase();
const avA = (a, cls) => `<span class="av ${cls||""}" style="background:hsl(${hue(a)} 45% 82%);color:#1d2a33" title="${esc(a)}">${esc(initials(a))}</span>`;
function hue(s){ let h = 0; for (const c of String(s)) h = (h*31 + c.charCodeAt(0)) % 360; return h; }
function avatar(id, cls){
  const a = aliasOf(id), u = PEOPLE[id]?.avatar_url;
  if (u) return `<img class="av ${cls||""}" src="${esc(u)}" alt="" title="${esc(a)}" loading="lazy" decoding="async">`;
  return `<span class="av ${cls||""}" style="background:hsl(${hue(a)} 45% 82%);color:#1d2a33" title="${esc(a)}">${esc(initials(a))}</span>`;
}

/* ---------- filtros ---------- */
const allSpecs = [...new Set(DATA.flatMap(OF))].sort((a,b) => a.localeCompare(b,"es"));
allSpecs.forEach(s => $("spec").add(new Option(s+" ("+DATA.filter(u => OF(u).includes(s)).length+")", s)));
[...new Set(DATA.flatMap(CI))].sort((a,b) => a.localeCompare(b,"es")).forEach(c => $("city").add(new Option(c,c)));

const querySpec = () => { const q = norm($("q").value); return q && ALIAS[q] ? ALIAS[q] : null; };
const curSpec = () => $("spec").value || querySpec();
function matches(u, ignoreStatus){
  const sp = curSpec();
  if (sp && !OF(u).includes(sp)) return false;
  if ($("city").value && !CI(u).includes($("city").value)) return false;
  if (!ignoreStatus && statusFilter && status(u).k !== statusFilter) return false;
  const q = norm($("q").value);
  if (q && !querySpec()){
    const hay = norm(u.name+" "+CI(u).join(" ")+" "+OF(u).join(" "));
    if (!q.split(/\s+/).every(w => hay.includes(w))) return false;
  }
  return true;
}

/* ---------- tarjeta ---------- */
function tracker(u){
  const f = myFollow(u.id);
  const idx = f ? STAGES.findIndex(s => s[0] === f.stage) : -1;
  return `<div class="track" role="group" aria-label="Tu avance en ${esc(u.name)}">${
    STAGES.map((s,i) => `<button type="button" class="bub${i<=idx?" f":""}" data-stage="${s[0]}" data-uni="${u.id}" aria-pressed="${i<=idx}"><i class="ov"></i><span>${s[1]}</span></button>`).join("")
  }</div>`;
}
const NOT_OFFICIAL = /cursofuturosresidentes|resilab|emagister|empleabilidad/i;
function portalOf(u){
  if (u.portal) return { url: u.portal, pdf: /\.pdf($|[?#])/i.test(u.portal) };
  const s = (u.src || []).find(x => !NOT_OFFICIAL.test(x[1]));
  return s ? { url: s[1], pdf: /\.pdf($|[?#])/i.test(s[1]) } : null;
}
function card(u, opts = {}){
  const st = status(u), ne = nextEvent(u), sp = curSpec(), conv = new Set(u.specs);
  const stub = ne
    ? `<div class="d">${D(ne[0]).getDate()}</div><div class="m">${MES[D(ne[0]).getMonth()]}</div>`
    : `<div class="q">?</div><div class="m">sin fecha</div>`;
  const nextHtml = ne
    ? `<div class="nextline">${I.cal}<span>${esc(ne[1])} <mark>${rel(days(ne[0]))}</mark>${ne[3]?" (aprox.)":""}</span></div>`
    : (u.next ? `<div class="nextline">${I.cal}<span>${esc(u.next)}</span></div>` : "");
  const gap = sp && !conv.has(sp) ? `<div class="gap">Ofrece ${esc(sp)}, pero no la abrió en esta convocatoria.</div>` : "";
  const specs = [...OF(u)].sort((a, b) => (b === sp) - (a === sp) || conv.has(b) - conv.has(a));
  const chips = specs.map(s => `<span class="chip${conv.has(s)?" on":""}${s===sp?" hit":""}">${esc(s)}${u.cupos&&u.cupos[s]?" ("+u.cupos[s]+")":""}</span>`).join("")
    + (specs.length > 5 ? `<span class="chip chip-more" aria-hidden="true">+${specs.length - 5}</span>` : "");
  const fol = FOLLOWS.filter(f => f.uni_id === u.id && f.user_id !== ME?.id).map(f => f.user_id);
  const social = fol.length
    ? `<div class="social"><span class="stack">${fol.slice(0,5).map(i => avatar(i,"sm")).join("")}</span><span>${fol.length===1 ? esc(aliasOf(fol[0]))+" la sigue" : fol.length+" de tus grupos la siguen"}</span></div>`
    : "";
  const tl = u.tl.map(e => {
    const end = e[2] || e[0];
    const cls = days(end) < 0 ? "past" : (days(e[0]) <= 0 ? "now" : "");
    return `<li class="${cls}"><time>${fmtS(e[0])}${e[2]?"–"+fmtS(e[2]):""}</time><span>${esc(e[1])}</span></li>`;
  }).join("");
  const w = u.weights
    ? `<div class="weights" role="img" aria-label="${u.weights.map(x => x[0]+" "+x[1]+"%").join(", ")}">${u.weights.map((x,i) => `<span style="width:${x[1]}%;background:${COLORS[i]}"></span>`).join("")}</div><div class="wlegend">${u.weights.map((x,i) => `<span><i style="background:${COLORS[i]}"></i>${esc(x[0])} ${x[1]}%</span>`).join("")}</div>`
    : "";
  const following = !!myFollow(u.id);
  const followBar = PROFILE
    ? `<div class="follow">${following
        ? `<span class="lbl">Tu avance</span>${tracker(u)}<button class="btn ghost small" data-unfollow="${u.id}">Dejar de seguir</button>`
        : `<button class="btn small" data-follow="${u.id}">Seguir esta convocatoria</button><span class="hint">Te avisamos si cambia algo</span>`}</div>`
    : "";
  return `<details class="card" id="c-${u.id}${opts.k||""}"${opts.open?" open":""}><summary>
    <div class="stub" aria-hidden="true">${stub}</div>
    <div class="main"><div class="row1"><h3>${esc(u.name)}</h3><span class="pill ${st.c}">${st.t}</span></div>
      <div class="facts"><span>${I.pin}${esc(CI(u).join(" y "))}</span><span>${I.bank}${u.type}</span><span>${I.cap}${esc(u.cycle)}</span></div>
      <div class="facts"><span>${I.doc}Inscripción ${esc(u.cost)}</span></div>
      ${nextHtml}${gap}<div class="chips">${chips}</div>${social}
      <span class="more" aria-hidden="true"><span class="more-o">Ver detalles</span><span class="more-c">Ocultar detalles</span>${I.chev}</span></div></summary>
    ${followBar}
    ${(() => { const p = portalOf(u); return p ? `<div class="portal"><a class="btn small" href="${esc(p.url)}" target="_blank" rel="noopener">${p.pdf ? "Ver convocatoria oficial (PDF)" : /^https?:\/\/[^/]+\/?$/.test(p.url) ? "Ir a la página de la universidad" : "Ir al portal de la convocatoria"}</a></div>` : ""; })()}
    <div class="body">
      ${u.next && ne ? `<div class="note">${esc(u.next)}</div>` : ""}
      ${u.oferta ? `<p class="hint" style="margin:8px 0 0">Borde verde: programa abierto en esta convocatoria. Punteado: lo ofrece pero no lo abrió.</p>` : ""}
      <div class="cols">
        <div><h4>Cronograma</h4>${tl ? `<ul class="tl">${tl}</ul>` : '<p class="hint">Aún no hay cronograma verificado.</p>'}</div>
        <div><h4>Cómo se califica</h4>${w}${u.weightNote ? `<p class="hint">${esc(u.weightNote)}</p>` : ""}<h4>El examen</h4><p style="margin:0">${esc(u.exam)}</p></div>
      </div>
      <div class="cols">
        <div><h4>Requisitos</h4><ul>${u.req.map(r => `<li>${esc(r)}</li>`).join("")}</ul></div>
        <div><h4>Tips para este examen</h4><ul>${u.tips.map(r => `<li>${esc(r)}</li>`).join("")}</ul></div>
      </div>
      <div class="src"><h4>Fuente</h4>${u.src.map(s => `<div><a href="${s[1]}" target="_blank" rel="noopener">${esc(s[0])}</a></div>`).join("")}</div>
    </div></details>`;
}

/* ---------- pestañas ---------- */
function gate(title, lead){
  return `<div class="gate">
    <h1>${esc(title)}</h1><p class="lead">${esc(lead)}</p>
    <div id="authMsg"></div>
    <form id="authForm">
      <label>Correo<input type="email" id="a-email" autocomplete="email" required></label>
      <label>Contraseña<input type="password" id="a-pass" autocomplete="current-password" minlength="8" required></label>
      <button class="btn" type="submit" id="a-go">Entrar</button>
    </form>
    <p class="alt">¿Primera vez? <button type="button" id="a-switch">Crear una cuenta</button></p>
  </div>`;
}

function renderAll(){
  const list = DATA.filter(u => matches(u)).sort(sortU);
  $("list").innerHTML = list.map(u => card(u)).join("") || '<div class="empty">Ninguna institución ofrece esa combinación. Prueba otra especialidad o quita la ciudad.</div>';
  const base = DATA.filter(u => matches(u, true));
  const c = {open:0, proc:0, tbd:0, off:0};
  base.forEach(u => c[status(u).k]++);
  $("counts").innerHTML = [["open","abiertas"],["proc","en proceso"],["tbd","por confirmar"],["off","cerradas"]]
    .map(([k,t]) => `<button class="count st-${k}" data-st="${k}" aria-pressed="${statusFilter===k}"><b>${c[k]}</b>${t}</button>`).join("");
  $("others").innerHTML = OTHERS.map(o => `<li><b>${esc(o[0])}</b> · ${esc(o[1])} · ${esc(o[2])}</li>`).join("");
  $("nAll").textContent = DATA.length;
}

function pushBanner(){
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return "";
  const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  if (iOS && !standalone)
    return `<div class="banner"><span class="ico-tile">${I.bell}</span><span>Para recibir avisos en iPhone, instala la app: en Safari toca Compartir y elige <b>Agregar a pantalla de inicio</b>. Luego abre ResiTrack desde ahí.</span></div>`;
  if (Notification.permission === "granted") return "";
  if (Notification.permission === "denied")
    return `<div class="banner"><span class="ico-tile">${I.bell}</span><span>Los avisos están bloqueados en este navegador. Actívalos en los ajustes del sitio si quieres recibirlos.</span></div>`;
  return `<div class="banner"><span class="ico-tile">${I.bell}</span>Activa los avisos para enterarte cuando te reten, cuando termine un desafío y cuando cambie una convocatoria que te interesa.<button class="btn small" id="pushBtn">Activar avisos</button></div>`;
}

function feedHtml(){
  if (!FEED.length) return "";
  const mine = new Set(FOLLOWS.filter(f => f.user_id === ME?.id).map(f => f.uni_id));
  const specs = new Set(PROFILE?.specs || []);
  const rows = FEED.filter(c => mine.has(c.uni_id) || (c.specs||[]).some(s => specs.has(s))).slice(0,6);
  if (!rows.length) return "";
  return `<h2>Novedades</h2><p class="sub">Cambios recientes en lo que te interesa.</p><div class="feed">${
    rows.map(c => `<div class="it"><b>${esc(c.title)}</b>${c.summary?" — "+esc(c.summary):""}<time>${new Date(c.created_at).toLocaleDateString("es-CO",{day:"numeric",month:"short"})}</time></div>`).join("")
  }</div>`;
}

function renderMine(){
  if (!ME && !$("guide").hidden){ $("p-mine").innerHTML = ""; return; }
  if (!ME){ $("p-mine").innerHTML = gate("Entra a ResiTrack","Crea tu cuenta para seguir convocatorias, marcar tu avance y acompañarte con tus grupos."); return; }
  if (!PROFILE){
    $("p-mine").innerHTML = `<div class="gate"><h1>Falta tu perfil</h1><p class="lead">Dinos cómo te llamas y qué especialidades te interesan.</p><button class="btn" id="createBtn">Crear mi perfil</button></div>`;
    return;
  }
  const fol = FOLLOWS.filter(f => f.user_id === ME.id).map(f => BY[f.uni_id]).filter(Boolean).sort(sortU);
  const rec = DATA.filter(u => !myFollow(u.id) && (PROFILE.specs||[]).some(s => OF(u).includes(s))).sort(sortU);
  const recOpen = rec.filter(u => ["open","tbd"].includes(status(u).k));
  $("p-mine").innerHTML = `${pushBanner()}${countdownBox()}${strengthsBox()}${feedHtml()}
    <h2>Lo que sigues</h2><p class="sub">Toca los óvalos para marcar tu avance. Tus grupos lo ven.</p>
    <div class="list">${fol.map(u => card(u,{k:"-m"})).join("") || '<div class="empty">Aún no sigues ninguna convocatoria. Abajo están las que coinciden con tus especialidades.</div>'}</div>
    <h2>Para tus especialidades</h2><p class="sub">${esc((PROFILE.specs||[]).join(", ") || "Elige especialidades en tu perfil")}. Primero las abiertas o por confirmar.</p>
    <div class="list">${(recOpen.length ? recOpen : rec.slice(0,6)).map(u => card(u,{k:"-r"})).join("") || '<div class="empty">Nada nuevo por ahora.</div>'}</div>`;
}

function personCard(id, gid){
  const p = PEOPLE[id]; if (!p) return "";
  const key = (gid || "f") + ":" + id;
  const open = RETAR_OPEN === key;
  const k = STREAKS[id]?.together || 0;
  const fire = id !== ME.id && k ? `<span class="prow-fire" title="Racha de batallas">🔥 ${k} ${k === 1 ? "día" : "días"}${atRisk(id) ? ` <span aria-label="en riesgo">⌛</span>` : ""}</span>` : "";
  const act = id === ME.id ? `<span class="hint">Tú</span>` : `<button class="btn small retar-btn" data-retar="${key}">Retar</button>`;
  return `<div class="prow"><button type="button" class="prow-who" data-person="${id}" data-g="${gid||""}">${avatar(id, "md")}<span class="prow-txt"><span class="prow-name">${esc(p.alias)}</span>${p.city ? `<span class="prow-sub">${esc(p.city)}</span>` : ""}</span></button>${fire}${act}
    ${open ? `<div class="retar"><span class="hint">¿Cuántas preguntas?</span>${[3,5,10].map(n => `<button class="btn small" data-retar-go="${id}" data-g="${gid||""}" data-n="${n}">${n}</button>`).join("")}<button class="btn ghost small" data-retar-x>Cancelar</button></div>` : ""}</div>`;
}
function personDetail(id, gid){
  const p = PEOPLE[id]; if (!p) return "";
  const f = FOLLOWS.filter(x => x.user_id === id).map(x => [BY[x.uni_id], x]).filter(x => x[0]).sort((a,b) => sortU(a[0],b[0]));
  const key = (gid || "f") + ":" + id;
  const retar = id === ME.id ? "" : (RETAR_OPEN === key
    ? `<div class="retar"><span class="hint">¿Cuántas preguntas?</span>${[3,5,10].map(n => `<button class="btn small" data-retar-go="${id}" data-g="${gid||""}" data-n="${n}">${n}</button>`).join("")}<button class="btn ghost small" data-retar-x>Cancelar</button></div>`
    : `<button class="btn small retar-btn" data-retar="${key}">Retar</button>`);
  return `<div class="person pdetail"><div class="hd">${avatar(id, "lg")}<div style="flex:1"><h3>${esc(p.alias)}${id===ME.id?" (tú)":""}</h3><div class="hint">${esc(p.city||"")}</div></div></div>
    ${retar}
    ${STREAKS[id] ? `<div class="pstreak">${id === ME.id
      ? `Tu racha: ${STREAKS[id].solo ? fire(STREAKS[id].solo) : "0"}`
      : `Batallas: ${STREAKS[id].together ? fire(STREAKS[id].together) : "0"}${atRisk(id) ? " ⌛" : ""} <span class="hint">· su racha ${STREAKS[id].solo}</span>`}</div>` : ""}
    <div class="chips">${(p.specs||[]).map(s => `<span class="chip on">${esc(s)}</span>`).join("")}</div>
    ${p.note ? `<div class="hint" style="font-size:14px">${esc(p.note)}</div>` : ""}
    <div class="mini">${f.length ? f.map(([u,x]) => {
      const i = STAGES.findIndex(s => s[0] === x.stage);
      return `<div><span>${esc(u.name.split(" · ")[0].replace("Pontificia Universidad ","P. U. ").replace("Universidad ","U. "))}</span><span class="dots" title="${esc(STAGES[i]?.[1]||"")}">${STAGES.map((s,j) => `<i class="${j<=i?"f":""}"></i>`).join("")}</span></div>`;
    }).join("") : '<span class="hint">Aún no sigue convocatorias.</span>'}</div>
    ${gid === null && id !== ME.id ? `<button class="linkish" data-funfriend="${id}">Quitar de amigos</button>` : ""}
    ${gid && id !== ME.id && !FRIENDS.includes(id) ? (() => {
      const rq = FREQS.find(r => r.other === id);
      if (rq && rq.incoming) return `<button class="btn small" data-faccept="${id}">Aceptar solicitud de amistad</button>`;
      if (rq) return `<span class="hint">Solicitud de amistad enviada</span> <button class="linkish" data-fcancel="${id}" data-alias="${esc(PEOPLE[id]?.alias || "")}">Cancelar solicitud</button>`;
      return `<button class="btn ghost small" data-fadd="${id}">Agregar amigo</button>`;
    })() : (gid && FRIENDS.includes(id) ? `<span class="hint">Ya son amigos</span>` : "")}</div>`;
}

function renderFriends(){
  return renderFriendsBody(PROFILE.friend_code || "", FREQS.filter(r => !r.incoming));
}
function friendReqBox(){
  const incoming = FREQS.filter(r => r.incoming);
  return incoming.length ? `<section class="sec" id="sec-solic"><h3 class="sec-h">Solicitudes recibidas</h3><div class="plist">${incoming.map(r =>
    `<div class="prow"><span class="prow-who">${PEOPLE[r.other] ? avatar(r.other, "md") : avA(r.alias, "md")}<span class="prow-txt"><span class="prow-name">${esc(r.alias)}</span>${r.city ? `<span class="prow-sub">${esc(r.city)}</span>` : ""}</span></span><span class="req-act"><button class="btn small btn-ok" data-faccept="${r.other}">Aceptar</button><button class="btn small btn-no" data-freject="${r.other}">Rechazar</button></span></div>`).join("")}</div></section>` : "";
}
function renderFriendsBody(code, outgoing){
  const cards = FRIENDS.map(id => personCard(id, null)).join("");
  const nIn = FREQS.filter(r => r.incoming).length;
  const invite = `<div class="fcode"><div class="fcode-main"><span class="fcode-lbl">Tu código de invitación</span><div class="fcode-row"><span class="code">${esc(code)}</span><button type="button" class="icon-btn" data-copy-code aria-label="Copiar código">${I.copy}</button></div><button class="btn" id="shareCode">${I.share}Compartir invitación</button><p class="fcode-note">Invita a tus colegas y construye tu red de estudio en ResiTrack.</p></div><span class="fcode-art" aria-hidden="true">${I.userplus}</span></div>
    <form id="friendForm" class="fadd"><input id="f-code" maxlength="6" placeholder="Código de tu amigo" style="text-transform:uppercase" required><button class="btn small" type="submit">Agregar</button></form>`;
  const stat = (act, n, t, ico, hot) => `<button type="button" class="stat${hot ? " hot" : ""}" ${act}><span class="stat-ico">${ico}</span><b>${n}</b><span>${t}</span></button>`;
  const stats = `<div class="stats">${stat('data-goto="sec-amigos"', FRIENDS.length, FRIENDS.length === 1 ? "Amigo" : "Amigos", I.users)}${stat('data-fview="solicitudes"', nIn + outgoing.length, nIn + outgoing.length === 1 ? "Solicitud pendiente" : "Solicitudes pendientes", I.doc, nIn > 0)}${stat('data-fview="grupos"', GROUPS.length, GROUPS.length === 1 ? "Grupo de estudio" : "Grupos de estudio", I.users)}</div>`;
  // Liga: la del primer grupo con al menos dos personas.
  const g = GROUPS.find(x => (LEAGUE[x.id] || []).length >= 2), L = g ? LEAGUE[g.id] : [], meL = L.find(r => r.user_id === ME.id);
  const league = g && meL ? `<button type="button" class="league-card" data-fview="grupos" data-open-g="${g.id}"><span class="lg-ico">${I.trophy}</span><span class="lg-txt"><span class="lg-t">Liga semanal <span class="hint">· ${esc(g.name)}</span></span><b>${meL.correct ? `Puesto #${meL.pos}` : "Sin aciertos aún"} <span class="hint">de ${L.length}</span></b><span class="hint">${meL.correct} ${meL.correct === 1 ? "acierto" : "aciertos"} esta semana</span></span><span class="lg-side"><span class="lg-more">Ver tabla ${I.chev}</span><span class="stack">${L.slice(0, 3).map(r => avatar(r.user_id, "sm")).join("")}</span></span></button>` : "";
  const all = [...CHALLS].sort((a, b) => isMyTurn(b) - isMyTurn(a));
  const shown = FRIEND_ALL ? all : all.slice(0, 2);
  const retos = all.length ? `<section class="sec"><div class="sec-hd"><h3 class="sec-h">Retos recientes</h3>${all.length > 2 ? `<button type="button" class="sec-more" data-fall>${FRIEND_ALL ? "Ver menos" : "Ver todos"} ${I.chev}</button>` : ""}</div><div class="chlist">${shown.map(chRow).join("")}</div></section>` : "";
  return `${invite}${stats}${league}${retos}
    <section class="sec" id="sec-amigos"><h3 class="sec-h">Tus amigos (${FRIENDS.length})</h3>
    ${cards ? `<div class="plist">${cards}</div><p class="hint" style="margin:8px 2px 0">🔥 Racha de batallas: sube cada día que terminan un desafío entre ustedes. ⌛ significa que hoy todavía no han tenido batalla.</p>` : `<div class="empty">Aún no tienes amigos agregados. Comparte tu invitación o pide el código de alguien.</div>`}</section>`;
}
// Página aparte con las solicitudes de amistad recibidas y enviadas.
function requestsPage(){
  const outgoing = FREQS.filter(r => !r.incoming);
  return `<div class="playhead"><button class="btn ghost small" type="button" data-fview="amigos">Volver</button><h2 style="margin:0;flex:1">Solicitudes</h2></div>
    ${friendReqBox() || `<section class="sec"><h3 class="sec-h">Solicitudes recibidas</h3><div class="empty">No tienes solicitudes por responder.</div></section>`}
    ${outgoing.length ? `<section class="sec"><h3 class="sec-h">Solicitudes enviadas</h3><div class="plist">${outgoing.map(r =>
      `<div class="prow"><span class="prow-who">${PEOPLE[r.other] ? avatar(r.other, "md") : avA(r.alias, "md")}<span class="prow-txt"><span class="prow-name">${esc(r.alias)}</span><span class="prow-sub">${r.city ? esc(r.city) + " · " : ""}esperando respuesta</span></span></span><button class="btn ghost small" data-fcancel="${r.other}" data-alias="${esc(r.alias)}">Cancelar</button></div>`).join("")}</div></section>` : ""}`;
}

function groupOpen(id){ try { return localStorage.getItem("rt-g-" + id) === "1"; } catch(e){ return false; } }
document.addEventListener("toggle", e => {
  const d = e.target;
  if (d && d.matches && d.matches("details.gcard")){ try { localStorage.setItem("rt-g-" + d.dataset.gid, d.open ? "1" : "0"); } catch(err){} }
}, true);
// Invitación abierta en el navegador del celular: quien ya instaló la app puede seguir allá con el código.
let INVITE_IN_BROWSER = null;
{ const inv = new URLSearchParams(location.search).get("amigo");
  const mobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  if (inv && mobile && !standalone) INVITE_IN_BROWSER = inv.toUpperCase().slice(0, 6); }
function inviteBanner(){
  if (!INVITE_IN_BROWSER) return "";
  return `<div class="banner inv-banner"><b>¿Ya tienes ResiTrack instalada?</b> Abre la app desde tu pantalla de inicio, entra a Amigos y escribe este código en "Código de tu amigo": <span class="code">${esc(INVITE_IN_BROWSER)}</span><button class="btn small" type="button" data-inv-copy>Copiar código</button><button class="linkish" type="button" data-inv-x>Seguir aquí en el navegador</button></div>`;
}
document.addEventListener("click", async e => {
  if (e.target.closest("[data-inv-copy]")){ try { await navigator.clipboard.writeText(INVITE_IN_BROWSER); toast("Código copiado."); } catch(err){ toast("Código: " + INVITE_IN_BROWSER); } return; }
  if (e.target.closest("[data-inv-x]")){ INVITE_IN_BROWSER = null; renderGroup(); }
});
function renderGroup(){
  if (!ME){ $("p-group").innerHTML = inviteBanner() + gate("Tus amigos y grupos","Entra para agregar amigos, crear grupos y retarse."); return; }
  if (!PROFILE){ $("p-group").innerHTML = `<div class="empty">Primero crea tu perfil en la pestaña Para mí.</div>`; return; }
  if (PLAY){ $("p-group").innerHTML = renderPlay(); return; }
  if (RESULT){ $("p-group").innerHTML = renderResult(); return; }
  if (PERSON_OPEN && $("pdlg").open) renderPersonDlg();
  const nIn = FREQS.filter(r => r.incoming).length;
  const seg = `<div class="seg fseg" role="tablist"><button type="button" class="count" role="tab" data-fview="amigos" aria-pressed="${FVIEW === "amigos"}">Amigos${nIn ? ` <span class="seg-n">${nIn}</span>` : ""}</button><button type="button" class="count" role="tab" data-fview="grupos" aria-pressed="${FVIEW === "grupos"}">Grupos</button></div>`;
  let body;
  if (FVIEW === "solicitudes"){
    $("p-group").innerHTML = requestsPage();
    updateBadges();
    return;
  }
  if (FVIEW === "grupos"){
    const forms = `<div class="gforms">
      <form id="newGroup"><h4>Crear un grupo</h4><input id="g-name" maxlength="60" placeholder="Ej. Residencia 2027" required><button class="btn small" type="submit">Crear grupo</button></form>
      <form id="joinGroup"><h4>Unirme con un código</h4><input id="g-code" maxlength="6" placeholder="ABC123" style="text-transform:uppercase" required><button class="btn small" type="submit">Unirme</button></form>
    </div>`;
    const cards = GROUPS.map(g => {
      const ids = MEMBERS.filter(m => m.group_id === g.id).map(m => m.user_id);
      const cs = CHALLS.filter(c => c.group_id === g.id).slice(0, 6);
      const pend = cs.filter(isMyTurn).length;
      const sg = GSEG[g.id] || "liga";
      const inner = sg === "retos"
        ? (cs.length ? `<div class="chlist">${cs.map(chRow).join("")}</div>` : `<p class="hint" style="margin:0">Todavía no hay retos. Toca Retar en la tarjeta de alguien.</p>`)
        : `${leaguePanel(g.id)}<h4 class="ghead">Integrantes</h4><div class="plist">${ids.map(id => personCard(id, g.id)).join("")}</div>`;
      return `<details class="gcard" id="g-${g.id}" data-gid="${g.id}"${groupOpen(g.id)?" open":""}><summary class="gsum"><span class="g-ico" aria-hidden="true">${I.users}</span><span class="gsum-txt"><b class="gname">${esc(g.name)}</b><span class="hint">${ids.length} ${ids.length===1?"integrante":"integrantes"}${leagueLeader(g.id)}${pend?` · <span class="due">${pend} ${pend===1?"reto pendiente":"retos pendientes"}</span>`:""}</span></span><span class="chev" aria-hidden="true"></span></summary>
        <div class="gbody"><div class="g-code"><span class="hint">Código para invitar</span><span class="code">${esc(g.code)}</span></div>
        <p class="sub" style="margin:8px 0 12px">Quien tenga el código puede unirse.</p>
        <div class="seg gseg"><button type="button" class="count" data-gseg="${g.id}" data-v="liga" aria-pressed="${sg === "liga"}">Liga de la semana</button><button type="button" class="count" data-gseg="${g.id}" data-v="retos" aria-pressed="${sg === "retos"}">Retos${pend ? ` <span class="seg-n">${pend}</span>` : ""}</button></div>
        ${inner}
        <div style="margin-top:14px"><button class="btn ghost small" data-leave="${g.id}">Salir del grupo</button></div></div></details>`;
    }).join("");
    body = `<h2 id="sec-grupos" class="fv-h">Tus grupos</h2><p class="sub">Puedes estar en varios. Cada grupo ve tu perfil y tu avance.</p>${cards || '<div class="empty">Todavía no estás en ningún grupo. Crea uno y pásale el código a tus amigos.</div>'}${GROUPS.length ? '<h2>Otro grupo</h2>' : ''}${forms}`;
  } else {
    body = renderFriends();
  }
  $("p-group").innerHTML = `${inviteBanner()}${pushBanner()}${seg}${body}`;
  updateBadges();
}

function renderTop(){
  const b = $("meBtn");
  b.hidden = false;
  b.innerHTML = ME
    ? `${avatar(ME.id)}<span>${esc(PROFILE ? PROFILE.alias : "Tu perfil")}</span>${myStreak() ? fire(myStreak()) : ""}`
    : `<span style="padding-left:8px">Entrar</span>`;
}
function renderAllTabs(){
  if (!$("guide").hidden && OB_CUR === "cuenta") renderObAuth();
  renderTop();
  if (tab === "all") renderAll();
  if (tab === "mine") renderMine();
  if (tab === "group") renderGroup();
  if (tab === "study") renderStudy();
  $("nAll").textContent = DATA.length;
  updateBadges();
}
// Lleva una pestaña a su inicio. Pide confirmar si hay algo en curso que se perdería.
function tabHome(t){
  if (t === "study"){
    if (PRAC?.mode === "sim" && PRAC.screen === "run" && PRAC.picks.some(x => x != null) && !confirm("¿Salir del simulacro? Se pierde lo que llevas.")) return false;
    if (LIVE?.st && ["q","reveal"].includes(LIVE.st.status) && !confirm("¿Salir del quiz?")) return false;
    PRAC = null; SD = null; STUDY_VIEW = null;
    if (LIVE){ LIVE = null; if (LIVE_POLL) clearInterval(LIVE_POLL); LIVE_POLL = null; }
  }
  if (t === "group"){
    if (PLAY && PLAY.picks.some(x => x != null) && !confirm("¿Salir del desafío? Se pierden las respuestas que marcaste.")) return false;
    PLAY = null; RESULT = null; RETAR_OPEN = null; FVIEW = "amigos"; FRIEND_ALL = false;
  }
  if (t === "all" || t === "mine") document.querySelectorAll(`#p-${t} details.card[open]`).forEach(d => d.open = false);
  return true;
}
function setTab(t){
  tab = t;
  ["all","mine","study","group"].forEach(k => { $("p-"+k).hidden = k !== t; $("t-"+k).setAttribute("aria-selected", k === t); });
  // La nota de fuentes solo aplica a las convocatorias.
  $("srcFoot").hidden = !(t === "all" || t === "mine");
  // Vacía los paneles ocultos para no duplicar formularios (ids repetidos).
  ["mine","study","group"].forEach(k => { if (k !== t) $("p-"+k).innerHTML = ""; });
  try { localStorage.setItem("rt-tab", t); } catch(e){}
  renderAllTabs();
  if (t === "study") loadStudy().then(renderStudy);
  if (t === "group") loadStudy().then(() => { if (tab === "group") renderGroup(); });
}

/* ---------- datos ---------- */
async function loadAll(){
  if (!ME){ PROFILE = null; PEOPLE = {}; GROUPS = []; MEMBERS = []; FOLLOWS = []; FEED = []; FRIENDS = []; FREQS = []; return; }
  const [pr, gr, mb, fl, ch, fs, fr] = await Promise.all([
    SB.from("profiles").select("*"),
    SB.from("groups").select("*").order("created_at"),
    SB.from("group_members").select("group_id,user_id"),
    SB.from("follows").select("user_id,uni_id,stage"),
    SB.from("changes").select("*").order("created_at",{ascending:false}).limit(40),
    SB.from("friendships").select("*").eq("status","accepted"),
    SB.rpc("friend_requests")
  ]);
  FRIENDS = (fs.data || []).map(f => f.a === ME.id ? f.b : f.a);
  FREQS = fr.data || [];
  PEOPLE = {}; (pr.data||[]).forEach(p => PEOPLE[p.id] = p);
  PROFILE = PEOPLE[ME.id] || null;
  GROUPS = gr.data || [];
  MEMBERS = mb.data || [];
  FOLLOWS = fl.data || [];
  FEED = ch.data || [];
}

async function saveProfile(patch){
  const row = { id: ME.id, ...(PROFILE||{}), ...patch };
  delete row.created_at; delete row.updated_at;
  const { data, error } = await SB.from("profiles").upsert(row).select().single();
  if (error){ toast("No pude guardar tu perfil."); return false; }
  PROFILE = data; PEOPLE[ME.id] = data; return true;
}
async function setFollow(uniId, stage){
  const { error } = await SB.from("follows").upsert({ user_id: ME.id, uni_id: uniId, stage });
  if (error){ toast("No pude guardar el cambio."); return; }
  const f = myFollow(uniId);
  if (f) f.stage = stage; else FOLLOWS.push({ user_id: ME.id, uni_id: uniId, stage });
  renderAllTabs();
}
async function unfollow(uniId){
  const { error } = await SB.from("follows").delete().eq("user_id", ME.id).eq("uni_id", uniId);
  if (error){ toast("No pude dejar de seguirla."); return; }
  FOLLOWS = FOLLOWS.filter(f => !(f.user_id === ME.id && f.uni_id === uniId));
  renderAllTabs();
}

/* ---------- perfil (diálogo) ---------- */
let pickSpecs = new Set();
function openProfile(){
  if (!ME){ setTab("mine"); return; }
  pickSpecs = new Set(PROFILE?.specs || []);
  $("dlgTitle").textContent = PROFILE ? "Tu perfil" : "Crea tu perfil";
  $("f-alias").value = PROFILE?.alias || "";
  $("f-city").value  = PROFILE?.city  || "";
  $("f-note").value  = PROFILE?.note  || "";
  PHOTO = { blob: null, remove: false };
  photoPreview();
  $("f-specs").innerHTML = allSpecs.map(s => `<button type="button" data-spec="${esc(s)}" aria-pressed="${pickSpecs.has(s)}">${esc(s)}</button>`).join("");
  $("dlg").showModal();
}
$("f-specs").addEventListener("click", e => {
  const b = e.target.closest("button[data-spec]"); if (!b) return;
  const s = b.dataset.spec;
  if (pickSpecs.has(s)) pickSpecs.delete(s); else pickSpecs.add(s);
  b.setAttribute("aria-pressed", pickSpecs.has(s));
});
$("f-cancel").addEventListener("click", () => $("dlg").close());
/* foto de perfil: se recorta cuadrada a 256 px en el teléfono antes de subirla */
let PHOTO = { blob: null, remove: false };
function photoPreview(){
  const el = $("f-ph"), url = PHOTO.blob ? URL.createObjectURL(PHOTO.blob) : (!PHOTO.remove && PROFILE?.avatar_url) || "";
  el.innerHTML = url ? `<img src="${esc(url)}" alt="">` : `<span>${esc(initials($("f-alias").value || PROFILE?.alias || "?"))}</span>`;
  $("f-photo-del").hidden = !url;
}
async function squareJpeg(file, size = 256){
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, bad) => { const im = new Image(); im.onload = () => ok(im); im.onerror = bad; im.src = url; });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const c = document.createElement("canvas"); c.width = c.height = size;
    c.getContext("2d").drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
    return await new Promise(ok => c.toBlob(ok, "image/jpeg", 0.85));
  } finally { URL.revokeObjectURL(url); }
}
$("f-photo").addEventListener("change", async e => {
  const f = e.target.files && e.target.files[0]; e.target.value = "";
  if (!f) return;
  if (!/^image\//.test(f.type)){ toast("Elige una imagen."); return; }
  try { PHOTO = { blob: await squareJpeg(f), remove: false }; photoPreview(); }
  catch(err){ toast("No pude leer esa imagen. Prueba con otra."); }
});
$("f-photo-del").addEventListener("click", () => { PHOTO = { blob: null, remove: true }; photoPreview(); });
const AV_PREFIX = "/storage/v1/object/public/avatars/";
async function savePhoto(){
  const old = PROFILE?.avatar_url, oldPath = old && old.includes(AV_PREFIX) ? old.split(AV_PREFIX)[1] : null;
  if (PHOTO.blob){
    const path = `${ME.id}/${Date.now()}.jpg`;
    const up = await SB.storage.from("avatars").upload(path, PHOTO.blob, { contentType: "image/jpeg", upsert: false, cacheControl: "31536000" });
    if (up.error){ toast("No pude subir la foto."); return undefined; }
    if (oldPath) SB.storage.from("avatars").remove([oldPath]);
    return SB.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  }
  if (PHOTO.remove){ if (oldPath) SB.storage.from("avatars").remove([oldPath]); return null; }
  return old || null;
}
$("pform").addEventListener("submit", async e => {
  e.preventDefault();
  const alias = $("f-alias").value.trim();
  if (!alias) return;
  $("f-save").disabled = true;
  const avatar_url = await savePhoto();
  const patch = { alias, city: $("f-city").value.trim() || null, note: $("f-note").value.trim() || null, specs: [...pickSpecs] };
  if (avatar_url !== undefined) patch.avatar_url = avatar_url;
  const okSave = await saveProfile(patch);
  $("f-save").disabled = false;
  $("dlg").close();
  if (okSave){
    toast("Perfil guardado."); renderAllTabs();
    let inv = null; try { inv = localStorage.getItem("rt-amigo"); } catch(e){}
    if (inv && inv !== PROFILE.friend_code){ try { localStorage.removeItem("rt-amigo"); } catch(e){} await addFriend(inv); }
  }
});

/* ---------- menú de cuenta ---------- */
// Tema: sigue al sistema hasta que la persona elige uno en el menú; la elección queda guardada.
const isDark = () => { const t = document.documentElement.dataset.theme; return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; };
function applyTheme(){
  const t = document.documentElement.dataset.theme, dark = isDark();
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => { if (t) m.content = dark ? "#081620" : "#F5F8FA"; });
  document.querySelectorAll("#cover picture source, #guide picture source").forEach(src => { src.media = t ? (dark ? "all" : "not all") : "(prefers-color-scheme: dark)"; });
}
function setTheme(t){
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("rt-theme", t); } catch(e){}
  applyTheme();
}
applyTheme();
function openMenu(){
  const m = $("menu");
  m.innerHTML = ME
    ? `<button data-act="profile">Editar mi perfil</button>
       <button data-act="push">Avisos en este dispositivo</button>
       <button data-act="theme">${isDark() ? "☀️ Cambiar a modo claro" : "🌙 Cambiar a modo oscuro"}</button>
       <hr><button data-act="out">Cerrar sesión</button>
       <div class="hint" style="padding:6px 12px">${esc(ME.email||"")}</div>`
    : `<button data-act="login">Entrar o crear cuenta</button><button data-act="theme">${isDark() ? "☀️ Cambiar a modo claro" : "🌙 Cambiar a modo oscuro"}</button>`;
  m.hidden = false;
}
document.addEventListener("click", e => {
  if (!e.target.closest("#menu") && !e.target.closest("#meBtn")) $("menu").hidden = true;
});
$("meBtn").addEventListener("click", e => { e.stopPropagation(); $("menu").hidden ? openMenu() : $("menu").hidden = true; });
$("menu").addEventListener("click", async e => {
  const b = e.target.closest("button[data-act]"); if (!b) return;
  $("menu").hidden = true;
  const a = b.dataset.act;
  if (a === "profile") openProfile();
  if (a === "login")   setTab("mine");
  if (a === "push")    enablePush();
  if (a === "theme")   setTheme(isDark() ? "light" : "dark");
  if (a === "out"){ await SB.auth.signOut(); location.reload(); }
});

/* ---------- eventos de la página ---------- */
document.addEventListener("click", async e => {
  const rb = e.target.closest("[data-report]");
  if (rb){ REPORT_OPEN = Number(rb.dataset.report); const y = window.scrollY; renderCurrent(); window.scrollTo(0, y); return; }
  if (e.target.closest("[data-report-cancel]")){ REPORT_OPEN = null; const y = window.scrollY; renderCurrent(); window.scrollTo(0, y); return; }
  const tabBtn = e.target.closest(".tab");
  if (tabBtn){ if (tabHome(tabBtn.dataset.tab)){ setTab(tabBtn.dataset.tab); window.scrollTo(0, 0); } return; }

  const cnt = e.target.closest(".count");
  if (cnt){ statusFilter = statusFilter === cnt.dataset.st ? "" : cnt.dataset.st; renderAll(); return; }

  if (e.target.closest("#createBtn")){ openProfile(); return; }
  if (e.target.closest("#pushBtn")){ enablePush(); return; }

  const f = e.target.closest("[data-follow]");
  if (f){ e.preventDefault(); setFollow(f.dataset.follow, "interes"); return; }

  const uf = e.target.closest("[data-unfollow]");
  if (uf){ e.preventDefault(); unfollow(uf.dataset.unfollow); return; }

  const bub = e.target.closest(".bub");
  if (bub){
    e.preventDefault();
    const cur = myFollow(bub.dataset.uni)?.stage;
    const i = STAGES.findIndex(s => s[0] === bub.dataset.stage);
    // tocar la etapa actual retrocede una
    const next = cur === bub.dataset.stage ? (i > 0 ? STAGES[i-1][0] : null) : bub.dataset.stage;
    if (next) setFollow(bub.dataset.uni, next); else unfollow(bub.dataset.uni);
    return;
  }

  const lv = e.target.closest("[data-leave]");
  if (lv){
    if (!confirm("¿Salir de este grupo?")) return;
    await SB.from("group_members").delete().eq("group_id", lv.dataset.leave).eq("user_id", ME.id);
    await loadAll(); renderAllTabs(); toast("Saliste del grupo.");
    return;
  }
});

["q","spec","city"].forEach(id => $(id).addEventListener("input", () => { if (tab === "all") renderAll(); }));

/* ---------- autenticación ---------- */
let signUpMode = false;
document.addEventListener("click", e => {
  if (!e.target.closest("#a-switch")) return;
  signUpMode = !signUpMode;
  $("a-go").textContent = signUpMode ? "Crear cuenta" : "Entrar";
  $("a-switch").textContent = signUpMode ? "Ya tengo cuenta" : "Crear una cuenta";
  $("a-pass").autocomplete = signUpMode ? "new-password" : "current-password";
  $("authMsg").innerHTML = signUpMode ? `<div class="ok">Usa una contraseña de al menos 8 caracteres.</div>` : "";
});
document.addEventListener("submit", async e => {
  if (e.target.id !== "authForm") return;
  e.preventDefault();
  const email = $("a-email").value.trim(), pass = $("a-pass").value;
  const btn = $("a-go"); btn.disabled = true; btn.textContent = "Un momento…";
  const { data, error } = signUpMode
    ? await SB.auth.signUp({ email, password: pass })
    : await SB.auth.signInWithPassword({ email, password: pass });
  btn.disabled = false; btn.textContent = signUpMode ? "Crear cuenta" : "Entrar";
  if (error){
    const msg = /Invalid login/i.test(error.message) ? "Correo o contraseña incorrectos."
              : /already registered/i.test(error.message) ? "Ese correo ya tiene cuenta. Entra con tu contraseña."
              : error.message;
    $("authMsg").innerHTML = `<div class="err">${esc(msg)}</div>`;
    return;
  }
  if (signUpMode && !data.session){
    $("authMsg").innerHTML = `<div class="ok">Te enviamos un correo para confirmar la cuenta. Ábrelo y vuelve aquí.</div>`;
    return;
  }
  await boot();
  if (!PROFILE) openProfile();
});

/* ---------- grupos ---------- */
document.addEventListener("submit", async e => {
  if (e.target.id === "newGroup"){
    e.preventDefault();
    const { error } = await SB.rpc("create_group", { p_name: $("g-name").value.trim() });
    if (error){ toast(error.message); return; }
    await loadAll(); renderAllTabs(); toast("Grupo creado. Comparte el código.");
  }
  if (e.target.id === "joinGroup"){
    e.preventDefault();
    const { error } = await SB.rpc("join_group", { p_code: $("g-code").value.trim().toUpperCase() });
    if (error){ toast(error.message); return; }
    await loadAll(); renderAllTabs(); toast("Ya estás en el grupo.");
  }
});

/* ---------- avisos push ---------- */
const b64 = s => {
  const pad = "=".repeat((4 - s.length % 4) % 4);
  const raw = atob((s + pad).replace(/-/g,"+").replace(/_/g,"/"));
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
};
async function enablePush(){
  if (!("serviceWorker" in navigator) || !("PushManager" in window)){ toast("Este navegador no admite avisos."); return; }
  try {
    // La clave pública la genera el servidor; aquí solo se lee.
    const { data: k } = await SB.from("meta").select("value").eq("key", "vapid_public").maybeSingle();
    if (!k?.value){ toast("Los avisos aún no están listos. Intenta en un rato."); return; }
    const reg = await navigator.serviceWorker.register("sw.js");
    const perm = await Notification.requestPermission();
    if (perm !== "granted"){ toast("No activaste los avisos."); return; }
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(k.value) });
    const j = sub.toJSON();
    const { error } = await SB.from("push_subs").upsert({
      user_id: ME.id, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth, ua: navigator.userAgent.slice(0,200)
    }, { onConflict: "endpoint" });
    if (error){ toast("No pude guardar el aviso."); return; }
    toast("Listo, te avisaremos aquí.");
    renderAllTabs();
  } catch(err){ toast("No pude activar los avisos."); }
}

/* ---------- estudiar: preguntas diarias y desafíos ---------- */
const AREAS = {
  basicas: "Ciencias básicas", clinicas: "Clínicas", quirurgicas: "Quirúrgicas",
  salud_publica: "Salud pública y epidemiología", sistema_salud: "Sistema de salud", cultura: "Cultura general"
};
// Subcategorías (deben coincidir con la tabla public.subareas).
const SUBAREAS = {
  basicas: [["fisiologia","Fisiología"],["anatomia","Anatomía"],["fisiopatologia","Fisiopatología"],["farmacologia","Farmacología"],["toxicologia","Toxicología"],["microbiologia","Microbiología"],["bioquimica","Bioquímica"],["genetica","Genética"],["inmunologia","Inmunología"],["embriologia","Embriología"]],
  clinicas: [["medicina_interna","Medicina interna"],["pediatria","Pediatría"],["urgencias","Urgencias"],["medicina_familiar","Medicina familiar"],["neurologia","Neurología"],["psiquiatria","Psiquiatría"],["dermatologia","Dermatología"]],
  quirurgicas: [["cirugia_general","Cirugía general"],["ginecobstetricia","Ginecología y obstetricia"],["ortopedia","Ortopedia"],["trauma","Trauma"],["cirugia_plastica","Cirugía plástica"],["cirugia_pediatrica","Cirugía pediátrica"],["otorrino","Otorrinolaringología"],["oftalmologia","Oftalmología"],["urologia","Urología"],["anestesiologia","Anestesiología"],["cirugia_vascular","Cirugía vascular"],["neurocirugia","Neurocirugía"]],
  salud_publica: [["epidemiologia","Epidemiología"],["bioestadistica","Bioestadística"],["mbe","Medicina basada en la evidencia"],["prevencion","Prevención y tamización"],["salud_comunitaria","Salud familiar y comunitaria"]],
  sistema_salud: [["normatividad","Normatividad y SGSSS"],["etica","Ética médica"],["medicina_legal","Medicina legal y forense"]]
};
const SUB_LABEL = Object.fromEntries(Object.values(SUBAREAS).flat());
const areaChips = q => `<span class="chip on">${esc(AREAS[q.area] || q.area)}</span>` +(q.subarea && SUB_LABEL[q.subarea] ? `<span class="chip on">${esc(SUB_LABEL[q.subarea])}</span>` : "");
let SUB_COUNTS = {};
const LETTERS = ["A","B","C","D","E"];
let DAILY = [], HISTORY = [], CHALLS = [], CH_ANS = [];
let REPORTED = new Set(), REPORT_OPEN = null;
let RETAR_OPEN = null, BACK_TAB = "study";
let FRIENDS = [], FREQS = [];
let FVIEW = "amigos";   // pestaña interna de Amigos: "amigos" | "grupos"
let GSEG = {};          // vista de cada grupo: "liga" | "retos"
let FRIEND_ALL = false; // mostrar todos los retos recientes
let PLAY = null;      // { id, rival, qs, picks }
let RESULT = null;    // jsonb de challenge_result
let studyBusy = false, studyLoaded = false;

async function loadStudy(){
  if (!ME || !PROFILE) return;
  const [d, h, c, a, k] = await Promise.all([
    SB.rpc("get_daily"),
    SB.rpc("my_study_history"),
    SB.from("challenges").select("*").order("created_at", { ascending: false }).limit(30),
    SB.from("challenge_answers").select("challenge_id,user_id,score"),
    SB.rpc("streaks_v2"),
    loadRank(),
    SB.rpc("my_reports").then(r => { REPORTED = new Set((r.data || []).map(Number)); }),
    loadPractice(),
    loadLeagues()
  ]);
  STREAKS = Object.fromEntries((k.data || []).map(r => [r.user_id, r]));
  DAILY = d.data || [];
  HISTORY = h.data || [];
  CHALLS = c.data || [];
  CH_ANS = a.data || [];
  const pend = CHALLS.filter(x => x.status === "pending" && !CH_ANS.some(r => r.challenge_id === x.id && r.user_id === ME.id)).length;
  updateBadges();
  studyLoaded = true;
}

let STREAKS = {};
let RANK = { period: "week", scope: "all", rows: [], open: false };
async function loadRank(){
  const { data } = await SB.rpc("leaderboard", { p_period: RANK.period, p_scope: RANK.scope });
  RANK.rows = data || [];
}
function rankPanel(){
  const rows = RANK.rows, me = rows.find(r => r.is_me);
  const medal = p => p === 1 ? "🥇" : p === 2 ? "🥈" : p === 3 ? "🥉" : p;
  const pct = r => r.answered ? Math.round(100 * r.correct / r.answered) + " %" : "–";
  const shown = RANK.open ? rows : rows.slice(0, 5);
  const av = r => PEOPLE[r.user_id] ? avatar(r.user_id, "sm") : `<span class="av sm" style="background:hsl(${hue(r.alias)} 45% 82%);color:#1d2a33">${esc(initials(r.alias))}</span>`;
  const list = shown.map(r => `<li class="${r.is_me ? "me-row" : ""}"><span class="rpos">${medal(r.pos)}</span><span class="rname">${av(r)}${esc(r.alias)}${r.is_me ? " (tú)" : ""}</span><span class="rscore"><b>${r.correct}</b> <span class="hint">${pct(r)}</span></span></li>`).join("");
  const meExtra = me && !shown.includes(me) ? `<li class="me-row sep"><span class="rpos">${me.pos}</span><span class="rname">${esc(me.alias)} (tú)</span><span class="rscore"><b>${me.correct}</b> <span class="hint">${pct(me)}</span></span></li>` : "";
  const chip = (k, v, label) => `<button class="count" data-rank-${k}="${v}" aria-pressed="${RANK[k] === v}">${label}</button>`;
  return `<div class="rank-box">
    <div class="rank-hd"><span class="ico-tile gold">${I.trophy}</span><h3>Ranking</h3></div>
    <div class="counts" style="margin:8px 0 4px">${chip("period","week","Esta semana")}${chip("period","month","Este mes")}${chip("period","all","Siempre")}</div>
    <div class="counts" style="margin:0 0 8px">${chip("scope","all","Todos")}${chip("scope","mine","Mis amigos y grupos")}</div>
    ${rows.some(r => r.answered > 0) ? `<ol class="rank">${list}${meExtra}</ol>
      ${rows.length > 5 ? `<button class="linkish" id="rankMore">${RANK.open ? "Ver menos" : `Ver las ${rows.length} posiciones`}</button>` : ""}`
      : `<p class="hint" style="margin:0">Todavía nadie ha respondido en este periodo. Sé el primero en el ranking.</p>`}
  </div>`;
}
const myStreak = () => STREAKS[ME?.id]?.solo || 0;
const fire = n => `<span class="fire" aria-label="racha de ${n} ${n===1?"día":"días"}">🔥${n}</span>`;
// Racha de batallas en riesgo: la llevan y hoy no han terminado ningún desafío juntos.
const atRisk = id => { const t = STREAKS[id]; return t && t.together > 0 && !t.battled_today; };

function streakHint(me){
  if (me.done_today) return "Hoy ya sumaste. Vuelve mañana.";
  if (bogotaDow() === 0 && !DAILY.length) return "Hoy es domingo de descanso: tu racha está a salvo.";
  const what = isSimDay() ? "el simulacro de hoy" : `las ${DAILY.length || 10} de hoy`;
  return me.solo ? `Termina ${what} para no perderla.` : `Termina ${what} para empezar tu racha.`;
}
function streakCard(){
  const me = STREAKS[ME.id]; if (!me) return "";
  return `<div class="streak-card"><span class="streak-flame" aria-hidden="true">🔥</span><div class="streak-txt"><b>Tu racha</b><span class="hint">${streakHint(me)}</span></div><div class="streak-val"><b>${me.solo}</b><span>${me.solo === 1 ? "día seguido" : "días seguidos"}</span></div></div>`;
}
function streakPanel(){
  const me = STREAKS[ME.id]; if (!me) return "";
  const mates = Object.values(STREAKS).filter(r => r.user_id !== ME.id)
    .sort((a,b) => (b.together - a.together) || aliasOf(a.user_id).localeCompare(aliasOf(b.user_id),"es")).slice(0, 10);
  const big = `<div class="streak-me"><div class="streak-num">${me.solo}</div><div><b>🔥 ${me.solo === 1 ? "día seguido" : "días seguidos"}</b><div class="hint">${streakHint(me)}</div></div></div>`;
  const list = mates.length ? `<div class="streak-mates">${mates.map(r => `<span class="smate${atRisk(r.user_id)?" risk":""}" title="${r.together ? `${r.together} días seguidos con batalla` : "Aún no tienen racha de batallas"}">${avatar(r.user_id,"sm")}<span>${esc(aliasOf(r.user_id))}</span>${r.together ? fire(r.together) : `<span class="hint">0</span>`}${atRisk(r.user_id) ? `<span aria-label="en riesgo">⌛</span>` : ""}</span>`).join("")}</div>
    <p class="hint" style="margin:6px 0 0">Racha de batallas: sube cada día que terminan un desafío entre ustedes. ⌛ significa que hoy todavía no han tenido batalla.</p>` : "";
  return `<div class="streak-box">${big}${list}</div>`;
}

function optList(q, opts){
  // opts: { pick, correct, mine, theirs, rivalName, locked, kind }
  return `<div class="opts" role="radiogroup">${q.options.map((o,i) => {
    const cls = [];
    if (opts.correct != null && i === opts.correct) cls.push("right");
    if (opts.pick != null && i === opts.pick && opts.correct != null && i !== opts.correct) cls.push("wrong");
    if (opts.pick === i) cls.push("picked");
    const tags = [];
    if (opts.mine === i) tags.push("Tú");
    if (opts.theirs === i) tags.push(esc(opts.rivalName));
    return `<button type="button" class="opt ${cls.join(" ")}" data-kind="${opts.kind||""}" data-q="${q.id ?? q.idx}" data-i="${i}" ${opts.locked?"disabled":""} role="radio" aria-checked="${opts.pick===i}">
      <span class="ov">${LETTERS[i]}</span><span class="txt">${esc(o)}</span>${tags.length?`<span class="who">${tags.join(" · ")}</span>`:""}</button>`;
  }).join("")}</div>`;
}

const REPORT_KINDS = [
  ["respuesta","La respuesta marcada está mal"],
  ["explicacion","La explicación tiene un error"],
  ["enunciado","Enunciado incompleto o confuso"],
  ["desactualizado","Dato desactualizado"],
  ["otro","Otro"]
];
function reportBox(qid){
  if (!qid || !ME) return "";
  if (REPORTED.has(Number(qid))) return `<p class="hint report-done">Reportaste esta pregunta. Gracias, la revisamos.</p>`;
  if (REPORT_OPEN !== Number(qid)) return `<button class="linkish report-link" type="button" data-report="${qid}">${I.flag}Reportar un error</button>`;
  return `<form class="report" data-report-form="${qid}">
    <b>¿Qué está mal?</b>
    <div class="report-kinds">${REPORT_KINDS.map(([k,t], i) => `<label><input type="radio" name="rk-${qid}" value="${k}"${i===0?" checked":""}> ${t}</label>`).join("")}</div>
    <textarea name="note" rows="2" maxlength="600" placeholder="Cuéntanos el detalle y, si puedes, la fuente (opcional)"></textarea>
    <div class="actions"><button class="btn ghost small" type="button" data-report-cancel>Cancelar</button><button class="btn small" type="submit">Enviar reporte</button></div>
  </form>`;
}
function feedback(ok, explanation, source, qid){
  // La explicación puede venir en varios párrafos separados por una línea en blanco.
  // Nunca se muestra un párrafo que hable del origen de la pregunta (reconstrucciones, grupo, respuesta marcada).
  const ORIGIN = /reconstru|el grupo (marc|discut|dec|dij)|respuesta oficial|marcaba |marcaron |clave del examen|en el examen (pregunt|marc|basta|de (la udea|univalle|20))|el examen (marc|daba|dio)/i;
  const paras = String(explanation || "").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).filter(p => !ORIGIN.test(p));
  // Dentro de un párrafo, cada renglón va aparte: "Paso N." queda en negrita y las cuentas (renglones con " = ") se resaltan.
  const line = l => /^Paso \d+\./.test(l) ? `<p class="fb-step">${esc(l).replace(/^(Paso \d+\.)/, "<b>$1</b>")}</p>`
    : / = /.test(l) && l.length < 140 ? `<p class="fb-calc">${esc(l)}</p>`
    : `<p>${esc(l).replace(/^OJO:/, "<b>OJO:</b>")}</p>`;
  const body = paras.map(p => { const ls = p.split(/\n/).map(l => l.trim()).filter(Boolean);
    return ls.length > 1 ? `<div class="fb-steps">${ls.map(line).join("")}</div>` : `<p>${esc(p).replace(/^OJO:/, "<b>OJO:</b>")}</p>`; }).join("");
  return `<div class="fb ${ok?"fb-ok":"fb-bad"}"><i class="fb-ico" aria-hidden="true">${ok?"✓":"✕"}</i><div class="fb-main"><div class="fb-hd">${ok?"Correcta.":"Incorrecta."}</div><div class="fb-body">${body}</div></div></div>${source?`<div class="fb-src"><span class="ico-tile">${I.doc}</span><div><b>Fuente</b><span>${esc(source)}</span></div></div>`:""}${reportBox(qid)}`;
}

function renderDaily(){
  if (!studyLoaded) return `<div class="empty">Cargando preguntas…</div>`;
  if (!DAILY.length) return `<div class="empty">Las preguntas de hoy todavía no están listas. Se publican cada madrugada.</div>`;
  const done = DAILY.filter(q => q.my_choice != null), ok = done.filter(q => q.is_correct).length;
  // En el simulacro el servidor no entrega aciertos ni explicaciones hasta terminar todas.
  const hidden = done.some(q => q.is_correct == null);
  const strip = DAILY.map(q => `<i class="${q.my_choice==null?"":q.is_correct==null?"done":q.is_correct?"ok":"bad"}" title="${q.slot}"></i>`).join("");
  const head = `<div class="sheet-head"><div class="strip" aria-label="Avance de hoy">${strip}</div>
    <p class="sub" style="margin:6px 0 0">${done.length === DAILY.length && !hidden
      ? `Terminaste: <b>${ok} de ${DAILY.length}</b> correctas.`
      : hidden ? `${done.length} de ${DAILY.length} respondidas. Verás tu resultado y la retroalimentación al terminar.`
      : `${done.length} de ${DAILY.length} respondidas${done.length?`, ${ok} correctas`:""}.`}
</p></div>`;
  const cards = DAILY.map(q => {
    const answered = q.my_choice != null;
    return `<article class="qcard" id="q-${q.id}">
      <div class="qmeta"><span class="qn">${q.slot}</span>${areaChips(q)}${answered && q.topic ? `<span class="hint">${esc(q.topic)}</span>` : ""}</div>
      <p class="stem">${esc(q.stem)}</p>
      ${optList(q, { kind:"daily", pick: q.my_choice, correct: answered ? q.correct : null, locked: answered })}
      ${answered && q.correct != null ? feedback(q.is_correct, q.explanation, q.source, q.id) : answered ? `<p class="hint" style="margin:6px 0 0">Respuesta guardada. La retroalimentación aparece al final del simulacro.</p>` : ""}
    </article>`;
  }).join("");
  return head + `<div class="qlist">${cards}</div>`;
}

function mates(){
  return Object.values(PEOPLE).filter(p => p.id !== ME.id).sort((a,b) => a.alias.localeCompare(b.alias,"es"));
}

const rivalOf = c => c.challenger === ME.id ? c.opponent : c.challenger;
const myChAns = id => CH_ANS.find(r => r.challenge_id === id && r.user_id === ME.id);
const isMyTurn = c => c.status === "pending" && !myChAns(c.id);
const pendingCount = () => ME ? CHALLS.filter(isMyTurn).length : 0;
function updateBadges(){
  const p = pendingCount(), r = FREQS.filter(x => x.incoming).length;
  const left = DAILY.length ? DAILY.filter(q => q.my_choice == null).length : 0;
  $("nStudy").textContent = left || "";
  $("nGroup").textContent = (p + r) || "";
}
function chRow(c){
  const rv = aliasOf(rivalOf(c)), my = myChAns(c.id), n = c.question_ids.length;
  const d = Math.floor((Date.now() - new Date(c.created_at)) / 864e5), ago = d <= 0 ? "hoy" : d === 1 ? "hace 1 día" : `hace ${d} días`;
  // Las filas de retos con resultado se abren tocándolas; las pendientes llevan sus botones.
  const row = (cls, tag, meta, act, open) => {
    const inner = `<span class="ch-ico" aria-hidden="true">${I.swords}</span><span class="ch-body"><b>Reto de ${n} preguntas</b><span class="hint">vs. ${esc(rv)}</span></span><span class="ch-side">${tag}<span class="hint">${meta}${meta ? " · " : ""}${ago}</span></span>`;
    return open ? `<button type="button" class="chrow ${cls}" data-chres="${c.id}" aria-label="Reto de ${n} preguntas contra ${esc(rv)}: ver retroalimentación">${inner}${I.chev}</button>`
      : `<div class="chrow ${cls}">${inner}${act ? `<span class="ch-act">${act}</span>` : ""}</div>`;
  };
  const tag = (t, k) => `<span class="ch-tag ${k}">${t}</span>`;
  if (c.status === "declined") return row("ch-off", tag("Rechazado", "off"), c.challenger === ME.id ? `${esc(rv)} lo rechazó` : "Lo rechazaste", "");
  if (c.status === "done"){
    const th = CH_ANS.find(r => r.challenge_id === c.id && r.user_id !== ME.id), a = my?.score ?? 0, b = th?.score ?? 0;
    const verdict = a > b ? "Ganaste" : a < b ? "Perdiste" : "Empate";
    return row(`ch-done ${a > b ? "ch-win" : a < b ? "ch-lose" : "ch-tie"}`, tag("Completado", "done"), `${verdict} ${a}–${b}`, "", true);
  }
  if (my) return row("ch-wait", tag(I.hourglass + "Esperando rival", "wait"), `Tu puntaje: ${my.score}/${n}`, "", true);
  return row("due", tag("Te toca", "due"), c.challenger === ME.id ? "Tu desafío" : "Te retó",
    `<button class="btn small" data-chplay="${c.id}">Jugar</button>${c.opponent===ME.id?` <button class="btn ghost small" data-chdecline="${c.id}">Rechazar</button>`:""}`);
}
function pendingBox(){
  const p = CHALLS.filter(isMyTurn);
  if (!p.length) return "";
  return `<div class="duebox"><h3>Te toca responder</h3><div class="chlist">${p.map(chRow).join("")}</div></div>`;
}

function renderChallenges(){
  const m = mates();
  const form = m.length
    ? `<form id="chForm" class="chform"><label>Retar a<select id="ch-who">${m.map(p => `<option value="${p.id}">${esc(p.alias)}</option>`).join("")}</select></label>
       <label>Preguntas<select id="ch-n"><option>5</option><option>3</option><option>10</option></select></label>
       <button class="btn small" type="submit">Enviar desafío</button></form>`
    : `<div class="empty">Únete a un grupo para poder retar a alguien.</div>`;
  return `<h2>Desafíos</h2><p class="sub">Reta a alguien de tus grupos. Gana quien acierte más. Ves tu retroalimentación apenas envías; el ganador se define cuando los dos terminan.</p>
    ${form}<div class="chlist">${CHALLS.map(chRow).join("") || '<div class="hint">Aún no tienes desafíos.</div>'}</div>`;
}

function renderPlay(){
  const all = PLAY.qs.every((q,i) => PLAY.picks[i] != null);
  return `<div class="playhead"><button class="btn ghost small" id="chBack">Volver</button><h2 style="margin:0">Desafío contra ${esc(PLAY.rival)}</h2></div>
    <p class="sub">Elige una respuesta en cada pregunta. Al enviar ves tu retroalimentación; el ganador se define cuando ${esc(PLAY.rival)} también termine.</p>
    <div class="qlist">${PLAY.qs.map((q,i) => `<article class="qcard"><div class="qmeta"><span class="qn">${i+1}</span>${areaChips(q)}</div>
      <p class="stem">${esc(q.stem)}</p>${optList({ ...q, id: i }, { kind:"play", pick: PLAY.picks[i] })}</article>`).join("")}</div>
    <div class="submitbar"><span class="hint">${PLAY.picks.filter(x => x!=null).length} de ${PLAY.qs.length}</span><button class="btn" id="chSubmit" ${all?"":"disabled"}>Enviar respuestas</button></div>`;
}

function renderResult(){
  const r = RESULT, rv = aliasOf(r.rival);
  const items = () => `<div class="qlist">${r.items.map(it => `<article class="qcard"><div class="qmeta"><span class="qn">${it.idx}</span>${areaChips(it)}</div>
      <p class="stem">${esc(it.stem)}</p>
      ${optList({ id: "r"+it.idx, options: it.options }, { correct: it.correct, pick: it.mine, mine: it.mine, theirs: r.done ? it.theirs : null, rivalName: rv, locked: true })}
      ${feedback(it.mine === it.correct, it.explanation, it.source, it.qid)}</article>`).join("")}</div>`;
  const dots = `<div class="duel-dots" aria-label="Tus respuestas">${r.items.map(it => `<span class="${it.mine === it.correct ? "d-ok" : "d-bad"}"><small>${it.idx}</small><i aria-hidden="true">${it.mine === it.correct ? "✓" : "✕"}</i></span>`).join("")}</div>`;
  if (r.done === false){
    // Aún falta el rival: se ve el propio puntaje y la retroalimentación, pero no el ganador ni sus respuestas.
    return `<div class="playhead"><button class="btn ghost small" id="chBack">Volver</button><h2 style="margin:0">Respuestas enviadas</h2></div>
      <div class="duel-tags"><span class="ch-tag async">Reto asíncrono</span><span class="ch-tag wait">${I.hourglass}Pendiente rival</span></div>
      <div class="score duel"><div class="duel-side">${avatar(ME.id, "lg")}<span>${r.my_score}</span>de ${r.total}<em class="duel-pill done">Ya respondiste</em></div><div class="vs">vs</div><div class="duel-side duel-wait">${avatar(r.rival, "lg")}<span aria-hidden="true">🔒</span>${esc(rv)}<em class="duel-pill">Pendiente</em></div></div>
      <div class="info-card"><span class="ico-tile">${I.info}</span><div><b>Estás esperando a ${esc(rv)}</b><p>El ganador se define cuando ${esc(rv)} termine. Te avisamos.</p></div></div>
      ${r.open ? dots + items() + `<div class="info-card lock"><span class="ico-tile">${I.lock}</span><div><b>Resultado de ${esc(rv)} pendiente</b><p>Su puntaje y el ganador aparecen cuando termine el reto.</p></div></div>` : `<div style="text-align:center;margin:10px 0 18px"><button class="btn" type="button" data-chres-open>Ver retroalimentación</button></div>`}`;
  }
  const verdict = r.my_score > r.their_score ? "Ganaste" : r.my_score < r.their_score ? `Ganó ${esc(rv)}` : "Empate";
  return `<div class="playhead"><button class="btn ghost small" id="chBack">Volver</button><h2 style="margin:0">${verdict}</h2></div>
    ${r.my_score > r.their_score ? `<div class="win-banner">${I.trophy}<b>¡Ganaste!</b></div>` : ""}
    <div class="score duel ${r.my_score > r.their_score ? "duel-won" : ""}"><div class="duel-side${r.my_score > r.their_score ? " win" : ""}">${avatar(ME.id, "lg")}<span>${r.my_score}</span>Tú</div><div class="vs">–</div><div class="duel-side${r.my_score < r.their_score ? " win" : ""}">${avatar(r.rival, "lg")}<span>${r.their_score}</span>${esc(rv)}</div></div>
    ${dots}${items()}`;
}
function renderCurrent(){ if (tab === "group") renderGroup(); else if (tab === "study") renderStudy(); else renderAllTabs(); }
// Día de la semana en Bogotá: 0 = domingo … 6 = sábado.
const DIAS = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
function bogotaDow(){
  const w = new Date().toLocaleDateString("en-US", { weekday: "short", timeZone: "America/Bogota" });
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(w);
}
// Sábado de simulacro: el set de ese día trae más de 10 preguntas (o aún no está listo).
const isSimDay = () => bogotaDow() === 6 && (!studyLoaded || !DAILY.length || DAILY.length > 10);
function renderStudy(){
  const el = $("p-study");
  if (!ME){ el.innerHTML = gate("Estudia con ResiTrack","Entra para responder las preguntas del día y retar a tus amigos."); return; }
  if (!PROFILE){ el.innerHTML = `<div class="empty">Primero crea tu perfil en la pestaña Para mí.</div>`; return; }
  if (PRAC){ el.innerHTML = renderPractice(); return; }
  if (SD){ el.innerHTML = renderStudyDate(); return; }
  if (LIVE){ el.innerHTML = renderLive(); return; }
  if (STUDY_VIEW === "sd"){ el.innerHTML = sdMenu(); return; }
  if (STUDY_VIEW !== "daily"){ el.innerHTML = `${streakCard()}${rankPanel()}${studyHub()}`; return; }
  const back = `<div class="playhead"><button class="btn ghost small" type="button" data-study-hub>Volver</button></div>`;
  const dow = bogotaDow();
  if (dow === 0 && !DAILY.length){
    el.innerHTML = `${back}<h2>Domingo: día de descanso</h2>
      <p class="sub">Hoy no hay preguntas. Descansa: el domingo no rompe tu racha ni tus rachas de batallas. Si quieres, igual puedes retar a alguien. Mañana vuelven las preguntas diarias.</p>`;
    return;
  }
  if (isSimDay()){
    const n = DAILY.length || 50;
    el.innerHTML = `${back}<h2>Simulacro</h2>
      <p class="sub">El simulacro del sábado abarca las preguntas de esta semana (lunes a viernes): ${n} preguntas en un orden nuevo y con las opciones reordenadas. Cuenta tu primera respuesta y, para sumar a tu racha, debes terminarlas todas.</p>
      <p class="sub"><b>Como en el examen real, la retroalimentación es al final:</b> mientras respondes no verás si acertaste. Cuando termines las ${n} aparecen tu puntaje, las respuestas correctas, las explicaciones y las fuentes.</p>
      ${studyLoaded && !DAILY.length ? `<div class="empty">El simulacro de hoy todavía no está listo. Se arma a medianoche.</div>` : renderDaily()}`;
    return;
  }
  const sn = STREAKS[ME.id]?.solo || 0;
  el.innerHTML = `${back}<div class="dq-hd"><span class="ico-tile">${I.target}</span><div class="dq-t"><h2>Preguntas diarias: ${DIAS[dow]}</h2><p class="sub">Ocho de medicina (básicas, clínicas, quirúrgicas, salud pública y sistema de salud) y dos de cultura general. Cuenta tu primera respuesta.</p></div><div class="streak-pill"><b>🔥 ${sn} ${sn === 1 ? "día" : "días"}</b><span>Racha actual</span></div></div>
    ${renderDaily()}`;
}

document.addEventListener("click", async e => {
  const opt = e.target.closest(".opt[data-kind]");
  if (opt && !opt.disabled){
    const i = Number(opt.dataset.i);
    if (opt.dataset.kind === "daily"){
      if (studyBusy) return; studyBusy = true;
      const qid = Number(opt.dataset.q);
      const { data, error } = await SB.rpc("answer_daily", { p_qid: qid, p_choice: i });
      studyBusy = false;
      if (error){ toast(error.message); return; }
      const r = data?.[0], q = DAILY.find(x => x.id === qid);
      if (q && r){ Object.assign(q, { my_choice: i, is_correct: r.is_correct, correct: r.correct, explanation: r.explanation, source: r.source }); }
      const h = HISTORY.find(x => x.day === new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" }));
      if (h){ h.answered++; if (r?.is_correct) h.correct++; }
      if (DAILY.every(x => x.my_choice != null)){
        if (DAILY.some(x => x.correct == null)){
          const fresh = await SB.rpc("get_daily");
          if (fresh.data) DAILY = fresh.data;
          HISTORY = (await SB.rpc("my_study_history")).data || HISTORY;
        }
        const k = await SB.rpc("streaks_v2");
        STREAKS = Object.fromEntries((k.data || []).map(x => [x.user_id, x]));
        await loadRank();
        renderTop();
        toast(`🔥 ${myStreak()} ${myStreak()===1?"día":"días"} seguidos. ¡Racha al día!`);
      }
      updateBadges(); renderStudy();
      document.getElementById("q-"+qid)?.scrollIntoView({ block: "nearest" });
      return;
    }
    if (opt.dataset.kind === "play"){
      PLAY.picks[Number(opt.dataset.q)] = i;
      const y = window.scrollY; renderCurrent(); window.scrollTo(0, y);
      return;
    }
  }
  const play = e.target.closest("[data-chplay]");
  if (play){
    const c = CHALLS.find(x => x.id === play.dataset.chplay);
    const { data, error } = await SB.rpc("get_challenge", { p_cid: c.id });
    if (error){ toast(error.message); return; }
    PLAY = { id: c.id, rival: aliasOf(c.challenger === ME.id ? c.opponent : c.challenger), qs: data, picks: data.map(() => null) };
    if (tab !== "group") setTab("group"); else renderGroup();
    window.scrollTo(0,0); return;
  }
  if (e.target.closest("[data-chres-open]") && RESULT){ RESULT.open = true; renderCurrent(); return; }
  const res = e.target.closest("[data-chres]");
  if (res){
    const { data, error } = await SB.rpc("challenge_result", { p_cid: res.dataset.chres });
    if (error){ toast(error.message); return; }
    RESULT = data; if (RESULT && RESULT.done === false) RESULT.open = true;
    if (tab !== "group") setTab("group"); else renderGroup();
    window.scrollTo(0,0); return;
  }
  const dec = e.target.closest("[data-chdecline]");
  if (dec){
    if (!confirm("¿Rechazar este desafío?")) return;
    const { error } = await SB.rpc("decline_challenge", { p_cid: dec.dataset.chdecline });
    if (error){ toast(error.message); return; }
    await loadStudy(); renderCurrent(); return;
  }
  if (e.target.closest("#chBack")){ PLAY = null; RESULT = null; await loadStudy(); renderCurrent(); window.scrollTo(0,0); return; }
  const fa = e.target.closest("[data-faccept],[data-freject]");
  if (fa){
    const other = fa.dataset.faccept || fa.dataset.freject, ok = !!fa.dataset.faccept;
    const { error } = await SB.rpc("respond_friend", { p_other: other, p_accept: ok });
    if (error){ toast(error.message); return; }
    toast(ok ? "Ahora son amigos." : "Solicitud rechazada.");
    await loadAll(); await loadStudy(); renderAllTabs(); return;
  }
  const fc = e.target.closest("[data-fcancel]");
  if (fc){
    if (!confirm(`¿Cancelar la solicitud de amistad a ${fc.dataset.alias || "esta persona"}?`)) return;
    const { error } = await SB.rpc("respond_friend", { p_other: fc.dataset.fcancel, p_accept: false });
    if (error){ toast(error.message); return; }
    toast("Solicitud cancelada.");
    await loadAll(); await loadStudy(); renderAllTabs(); return;
  }
  const fad = e.target.closest("[data-fadd]");
  if (fad){
    const { data, error } = await SB.rpc("send_friend_request_to", { p_other: fad.dataset.fadd });
    if (error){ toast(error.message); return; }
    toast({ enviada: `Solicitud enviada a ${aliasOf(fad.dataset.fadd)}.`, aceptada: "Ahora son amigos.", ya_amigos: "Ya son amigos.", pendiente: "Ya le habías enviado la solicitud." }[data] || "Listo.");
    await loadAll(); await loadStudy(); renderAllTabs(); return;
  }
  const uf2 = e.target.closest("[data-funfriend]");
  if (uf2){
    if (!confirm(`¿Quitar a ${aliasOf(uf2.dataset.funfriend)} de tus amigos?`)) return;
    await SB.rpc("remove_friend", { p_other: uf2.dataset.funfriend });
    await loadAll(); await loadStudy(); renderAllTabs(); return;
  }
  const fv = e.target.closest("[data-fview]");
  if (fv){
    FVIEW = fv.dataset.fview;
    if (fv.dataset.openG){ try { localStorage.setItem("rt-g-" + fv.dataset.openG, "1"); } catch(err){} }
    renderGroup();
    const tgt = fv.dataset.openG ? $("g-" + fv.dataset.openG) : null;
    if (tgt) tgt.scrollIntoView({ block: "start" }); else window.scrollTo(0, 0);
    return;
  }
  const gt = e.target.closest("[data-goto]");
  if (gt){ $(gt.dataset.goto)?.scrollIntoView({ block: "start", behavior: "smooth" }); return; }
  if (e.target.closest("[data-fall]")){ FRIEND_ALL = !FRIEND_ALL; const y = window.scrollY; renderGroup(); window.scrollTo(0, y); return; }
  const gs = e.target.closest("[data-gseg]");
  if (gs){ GSEG[gs.dataset.gseg] = gs.dataset.v; const y = window.scrollY; renderGroup(); window.scrollTo(0, y); return; }
  if (e.target.closest("[data-copy-code]")){
    try { await navigator.clipboard.writeText(PROFILE.friend_code); toast("Código copiado."); } catch(err){ toast("Tu código: " + PROFILE.friend_code); }
    return;
  }
  if (e.target.closest("#shareCode")){
    const url = location.origin + "/?amigo=" + encodeURIComponent(PROFILE.friend_code);
    const text = `${PROFILE.alias} te invita a ResiTrack para estudiar y retarse. Mi código de amigo es ${PROFILE.friend_code}.`;
    try {
      if (navigator.share) await navigator.share({ title: "ResiTrack", text, url });
      else { await navigator.clipboard.writeText(text + " " + url); toast("Invitación copiada."); }
    } catch(err){}
    return;
  }
  const rk = e.target.closest("[data-rank-period],[data-rank-scope]");
  if (rk){
    if (rk.dataset.rankPeriod) RANK.period = rk.dataset.rankPeriod;
    if (rk.dataset.rankScope) RANK.scope = rk.dataset.rankScope;
    await loadRank(); const y = window.scrollY; renderStudy(); window.scrollTo(0, y); return;
  }
  if (e.target.closest("#rankMore")){ RANK.open = !RANK.open; const y = window.scrollY; renderStudy(); window.scrollTo(0, y); return; }
  const ro = e.target.closest("[data-retar]");
  if (ro){ RETAR_OPEN = ro.dataset.retar; renderGroup(); return; }
  if (e.target.closest("[data-retar-x]")){ RETAR_OPEN = null; renderGroup(); return; }
  const rg = e.target.closest("[data-retar-go]");
  if (rg){
    if (studyBusy) return; studyBusy = true;
    const who = rg.dataset.retarGo;
    const { error } = rg.dataset.g
      ? await SB.rpc("create_challenge_in", { p_opponent: who, p_n: Number(rg.dataset.n), p_group: rg.dataset.g })
      : await SB.rpc("create_challenge", { p_opponent: who, p_n: Number(rg.dataset.n) });
    studyBusy = false;
    if (error){ toast(error.message); return; }
    RETAR_OPEN = null;
    toast(`Reto enviado a ${aliasOf(who)}. Ya puedes jugar tu parte.`);
    await loadStudy(); renderGroup(); return;
  }
  if (e.target.closest("#chSubmit")){
    if (studyBusy) return; studyBusy = true;
    const { data, error } = await SB.rpc("submit_challenge", { p_cid: PLAY.id, p_answers: PLAY.picks });
    studyBusy = false;
    if (error){ toast(error.message); return; }
    const r = data?.[0], cid = PLAY.id;
    PLAY = null;
    if (r?.status === "done"){
      const k = await SB.rpc("streaks_v2");
      STREAKS = Object.fromEntries((k.data || []).map(x => [x.user_id, x]));
    }
    const rr = await SB.rpc("challenge_result", { p_cid: cid });
    RESULT = rr.data || null;
    await loadStudy(); renderCurrent(); window.scrollTo(0,0); return;
  }
});

async function addFriend(code){
  const { data, error } = await SB.rpc("send_friend_request", { p_code: code.trim().toUpperCase() });
  if (error){ toast(error.message); return; }
  toast({ enviada: "Solicitud enviada.", pendiente: "Ya le habías enviado la solicitud.", aceptada: "Ahora son amigos.", ya_amigos: "Ya son amigos." }[data] || "Listo.");
  await loadAll(); await loadStudy(); renderAllTabs();
}
document.addEventListener("submit", async e => {
  if (e.target.id !== "friendForm") return;
  e.preventDefault(); addFriend($("f-code").value);
});
document.addEventListener("submit", async e => {
  if (e.target.id !== "chForm") return;
  e.preventDefault();
  const who = $("ch-who").value, n = Number($("ch-n").value);
  const { error } = await SB.rpc("create_challenge", { p_opponent: who, p_n: n });
  if (error){ toast(error.message); return; }
  toast(`Desafío enviado a ${aliasOf(who)}.`);
  await loadStudy(); renderCurrent();
});

/* ---------- arranque ---------- */
async function boot(){
  const { data } = await SB.auth.getSession();
  ME = data.session?.user || null;
  await loadAll();
  renderAllTabs();
  if (ME && PROFILE){
    let inv = null; try { inv = localStorage.getItem("rt-amigo"); } catch(e){}
    if (inv && inv !== PROFILE.friend_code){ try { localStorage.removeItem("rt-amigo"); } catch(e){} history.replaceState(null, "", location.pathname); await addFriend(inv); }
  }
  if (ME){ let want = null; try { want = localStorage.getItem("rt-push-want"); } catch(e){}
    if (want && "Notification" in window && Notification.permission === "granted"){ try { localStorage.removeItem("rt-push-want"); } catch(e){} enablePush(); } }
  if (ME && PROFILE){ await loadStudy(); renderTop(); if (tab === "study") renderStudy(); if (tab === "group") renderGroup(); if (tab === "mine") renderMine(); }
  const qz = new URLSearchParams(location.search).get("quiz");
  if (qz && ME && PROFILE) liveOpen(qz.trim().toUpperCase().slice(0, 5));
}
// Al volver a la app (o al llegar un aviso) se recargan solicitudes, retos y rachas: la app instalada no se recarga sola.
let LAST_REFRESH = Date.now(), REFRESHING = false;
async function refreshData(force){
  if (!ME || REFRESHING) return;
  if (!force && Date.now() - LAST_REFRESH < 20000) return;
  REFRESHING = true;
  try {
    await loadAll(); if (PROFILE) await loadStudy();
    LAST_REFRESH = Date.now();
    if (PLAY || SD || PRAC || LIVE) renderTop(); else renderAllTabs();
  } catch(e){} finally { REFRESHING = false; }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") refreshData(); });
window.addEventListener("pageshow", e => { if (e.persisted) refreshData(true); });
if ("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message", e => {
  if (!e.data || e.data.type !== "rt-refresh") return;
  if (e.data.tab && ["all","mine","study","group"].includes(e.data.tab) && !PLAY && !SD) setTab(e.data.tab);
  refreshData(true);
});
try { const t = localStorage.getItem("rt-tab"); if (t && ["all","mine","study","group"].includes(t)) tab = t; } catch(e){}
// Al abrir un aviso, la URL trae la pestaña (?tab=study).
{ const t = new URLSearchParams(location.search).get("tab"); if (t && ["all","mine","study","group"].includes(t)) tab = t; }
/* ---------- práctica: repaso de errores, mis áreas y simulacro ---------- */
// Simulacro general: mezcla preguntas de exámenes reales (UdeA, Univalle) y del banco, a ritmo de examen.
const SIM_SIZES = [25, 50, 100];
const SIM_MIN_PER_Q = 1.8;
const pctOf = (ok, n) => n ? Math.round(100 * ok / n) : 0;
async function loadPractice(){
  const [r, a, b, sc, h] = await Promise.all([
    SB.rpc("review_summary"), SB.rpc("my_area_stats"), SB.rpc("bank_size"), SB.rpc("subarea_counts"),
    SB.from("sim_attempts").select("uni,n,correct,secs,created_at").order("created_at", { ascending: false }).limit(6)
  ]);
  REV = r.data?.[0] || REV;
  AREA_STATS = a.data || [];
  BANK = b.data || 0;
  SUB_COUNTS = Object.fromEntries((sc.data || []).map(x => [x.subarea, x.n]));
  SIM_HIST = h.data || [];
}
// Área más floja: la de menor % entre las que tienen al menos 3 respuestas (sin contar cultura general).
function weakestArea(){
  const c = AREA_STATS.filter(x => x.answered >= 3 && x.area !== "cultura").sort((x, y) => (x.correct / x.answered) - (y.correct / y.answered));
  return c[0] && c[0].correct < c[0].answered ? c[0] : null;
}
const HUB_ICONS = {
  daily: svgI('<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17M8.5 15l2 2 4-4"/>'),
  ref: svgI('<path d="M4 19h16"/><path d="M6.5 16v-4M11.5 16V8M16.5 16v-6"/><path d="M14 5h4v4"/>'),
  sim: svgI('<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 2M10 2.5h4M18.5 6l1.5-1.5"/>'),
  sd: svgI('<circle cx="9" cy="8.5" r="3"/><circle cx="17" cy="9.5" r="2.5"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M15 14.2c2.5-.4 4.6 1 5.2 4.3"/>')
};
function studyHub(){
  const dow = bogotaDow(), sim = isSimDay(), n = DAILY.length;
  const done = DAILY.filter(q => q.my_choice != null).length, ok = DAILY.filter(q => q.is_correct).length;
  let dline, dhot = false;
  if (!studyLoaded) dline = "Cargando…";
  else if (dow === 0 && !n) dline = "Hoy es domingo: descanso";
  else if (!n) dline = sim ? "El simulacro se arma a medianoche" : "Se publican cada madrugada";
  else if (done < n){ dline = sim ? `${done} de ${n} respondidas` : `${n - done} por responder hoy`; dhot = true; }
  else dline = DAILY.some(q => q.correct == null) ? "Entregado" : `Terminaste: ${ok} de ${n}`;
  const w = weakestArea();
  const rline = REV.due_now ? `${REV.due_now} para repasar hoy` : w ? `Más floja: ${AREAS[w.area]}` : REV.upcoming ? `Próximo repaso: ${fmtS(REV.next_due)}` : "Tus aciertos por área";
  const card = (attr, k, title, line, hot) => `<button type="button" class="hub-card hub-${k}${hot ? " hot" : ""}" ${attr}><span class="hub-ico" aria-hidden="true">${HUB_ICONS[k]}</span><span class="hub-txt"><b>${title}</b><span>${esc(line)}</span></span></button>`;
  return `<div class="hub">
    ${card("data-study-daily", "daily", sim ? "Simulacro del sábado" : "Preguntas diarias", dline, dhot)}
    ${card('data-pr="refuerzo"', "ref", "Reforzar debilidades", rline, REV.due_now > 0)}
    ${card('data-pr="sim"', "sim", "Simulacro", "Mezcla de estilos, con cronómetro", false)}
    ${card("data-sd-menu", "sd", "Study Date", "Ruleta o quiz en vivo con tus amigos", false)}
  </div>`;
}
function prHead(title, extra){
  return `<div class="playhead"><button class="btn ghost small" type="button" data-pr-back>Volver</button><h2 style="margin:0;flex:1">${title}</h2>${extra || ""}</div>`;
}
function renderAreas(){
  const rows = Object.keys(AREAS).filter(k => k !== "cultura" || AREA_STATS.some(x => x.area === k)).map(k => AREA_STATS.find(x => x.area === k) || { area: k, answered: 0, correct: 0, topics: [], subs: [] });
  const w = weakestArea();
  const any = rows.some(r => r.answered);
  const rev = REV.due_now
    ? `<div class="sim-go"><span><b>${REV.due_now}</b> ${REV.due_now === 1 ? "pregunta fallada vuelve" : "preguntas falladas vuelven"} hoy</span><button type="button" class="btn" data-pr="review">Repasar</button></div>`
    : `<p style="margin:0">${REV.upcoming ? `Hoy no tienes repaso. El próximo es el <b>${fmtS(REV.next_due)}</b> (${REV.upcoming} en cola).` : "Aún no tienes errores para repasar."}</p>`;
  return `${prHead("Reforzar debilidades")}
    <div class="sim-card"><h3 style="margin:0 0 6px">Repaso de errores</h3>${rev}
      <p class="hint" style="margin:8px 0 0">Lo que fallas vuelve a los 3 días; si lo aciertas, a los 7; si lo vuelves a acertar, queda dominado.${REV.mastered ? ` Llevas ${REV.mastered} ${REV.mastered === 1 ? "dominada" : "dominadas"}.` : ""}</p></div>
    <h3 style="margin:18px 0 4px">Por área</h3>
    <p class="sub">Tus aciertos en las preguntas diarias. Toca un área para ver sus subcategorías y practicar la que más necesites.</p>
    ${any ? "" : `<div class="empty">Todavía no hay datos. Responde las preguntas diarias y aquí verás en qué vas bien y en qué no.</div>`}
    <div class="areas">${rows.map(r => {
      const p = pctOf(r.correct, r.answered), weak = w && w.area === r.area;
      const ws = weakSub(r);
      return `<button type="button" class="area-row area-btn${weak ? " weak" : ""}" data-pr-open="${r.area}">
        <div class="area-top"><b>${esc(AREAS[r.area])}</b>${weak ? `<span class="due">Tu área más floja</span>` : ""}<span class="area-pct">${r.answered ? p + " %" : "–"}</span>${I.chev}</div>
        <div class="bar" aria-hidden="true"><i style="width:${r.answered ? Math.max(p, 3) : 0}%"></i></div>
        <div class="area-meta"><span class="hint">${r.answered ? `${r.correct} de ${r.answered} correctas` : "Sin respuestas todavía"}${ws ? ` · más floja: ${esc(SUB_LABEL[ws.sub])}` : ""}</span></div>
      </button>`;
    }).join("")}</div>`;
}
// Subcategoría más floja de un área: la de menor % entre las que tienen respuestas.
function weakSub(r){
  const s = (r.subs || []).filter(x => x.n > 0).sort((a, b) => (a.ok / a.n) - (b.ok / b.n) || b.n - a.n)[0];
  return s && s.ok < s.n ? s : null;
}
function renderArea(area){
  const r = AREA_STATS.find(x => x.area === area) || { area, answered: 0, correct: 0, topics: [], subs: [] };
  const p = pctOf(r.correct, r.answered), ws = weakSub(r);
  const tps = (r.topics || []).slice(0, 5);
  const subs = (SUBAREAS[area] || []).map(([k, label]) => {
    const st = (r.subs || []).find(x => x.sub === k), n = SUB_COUNTS[k] || 0, sp = st ? pctOf(st.ok, st.n) : null;
    const weak = ws && ws.sub === k;
    return `<div class="area-row sub-card${weak ? " weak" : ""}">
      <div class="area-top"><b>${esc(label)}</b>${weak ? `<span class="due">La más floja</span>` : ""}<span class="area-pct">${sp == null ? "–" : sp + " %"}</span></div>
      <div class="bar" aria-hidden="true"><i style="width:${sp == null ? 0 : Math.max(sp, 3)}%"></i></div>
      <div class="area-meta"><span class="hint">${st ? `${st.ok} de ${st.n} correctas` : "Sin respuestas todavía"} · ${n} ${n === 1 ? "pregunta" : "preguntas"} en el banco</span>${n ? `<button type="button" class="btn small" data-pr-sub="${k}">Practicar</button>` : ""}</div>
    </div>`;
  }).join("");
  return `${prHead(esc(AREAS[area]))}
    <div class="sim-card">
      <div class="area-top"><b>Toda el área</b><span class="area-pct">${r.answered ? p + " %" : "–"}</span></div>
      <div class="bar" aria-hidden="true"><i style="width:${r.answered ? Math.max(p, 3) : 0}%"></i></div>
      <div class="area-meta"><span class="hint">${r.answered ? `${r.correct} de ${r.answered} correctas` : "Sin respuestas todavía"}</span><button type="button" class="btn small" data-pr-area="${area}">Practicar el área</button></div>
      ${tps.length ? `<div class="area-topics"><span class="hint">Temas que fallaste:</span>${tps.map(t => `<span class="chip">${esc(t.topic)} · ${t.ok}/${t.n}</span>`).join("")}</div>` : ""}
    </div>
    ${(SUBAREAS[area] || []).length ? `<h3 style="margin:18px 0 4px">Subcategorías</h3><p class="sub">Practicar trae 10 preguntas del banco de esa subcategoría, primero las que no has visto o fallaste. No cuenta para el ranking ni las rachas.</p><div class="areas">${subs}</div>` : ""}`;
}
function simPlan(size){
  const n = Math.min(size, BANK);
  return { n, mins: Math.max(5, Math.round(n * SIM_MIN_PER_Q)) };
}
function renderSimSetup(){
  const pick = PRAC.size || 50;
  const hist = SIM_HIST.length ? `<h4 class="ghead">Tus últimos simulacros</h4><div class="chlist">${SIM_HIST.map(h => `<div class="chrow"><span>${h.correct} de ${h.n} (${pctOf(h.correct, h.n)} %) · ${Math.round(h.secs / 60)} min</span><span class="hint">${new Date(h.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}</span></div>`).join("")}</div>` : "";
  const plan = simPlan(pick);
  return `${prHead("Simulacro")}
    <p class="sub">Con cronómetro y sin retroalimentación hasta terminar, como el examen real. Mezcla preguntas de exámenes pasados de la UdeA y Univalle (verificadas con la evidencia actual) y del banco de ResiTrack, para que llegues listo a cualquier estilo. No cuenta para el ranking ni las rachas.</p>
    <div class="seg" role="group" aria-label="Número de preguntas">${SIM_SIZES.map(k => `<button type="button" class="count" data-pr-size="${k}" aria-pressed="${pick === k}">${k}</button>`).join("")}</div>
    <div class="sim-card sim-hero"><span class="sim-art" aria-hidden="true">${I.stopwatch}</span>
      ${plan.n < pick ? `<p class="hint" style="margin:0 0 8px">Hoy hay ${plan.n} preguntas disponibles, así que este simulacro trae ${plan.n}. El banco crece cada noche.</p>` : ""}
      <div class="sim-go"><span><b>${plan.n}</b> preguntas · <b>${plan.mins}</b> min</span><button type="button" class="btn" data-pr-start ${plan.n < 5 ? "disabled" : ""}>Empezar simulacro</button></div>
      <p class="hint" style="margin:8px 0 0">Ritmo de examen: unos ${String(SIM_MIN_PER_Q).replace(".", ",")} minutos por pregunta. Lo que falles pasa a tu repaso.</p>
    </div>
    ${hist}`;
}
function clockText(ms){
  const s = Math.max(0, Math.round(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
  return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(x).padStart(2, "0");
}
function renderRun(){
  const P = PRAC, sim = P.mode === "sim", done = P.picks.filter(x => x != null).length;
  const clock = sim ? `<span class="sim-clock" id="simClock" aria-live="off">${clockText(P.endsAt - Date.now())}</span>` : "";
  const intro = P.mode === "review"
    ? `Estas son preguntas que fallaste. Si la aciertas, vuelve en 7 días; si la aciertas otra vez, queda dominada. Si la fallas, vuelve en 3 días.`
    : sim ? `Puedes cambiar tus respuestas hasta terminar. Al acabarse el tiempo, el simulacro se entrega solo.`
    : `Preguntas del banco para practicar. No cuentan para el ranking; lo que falles pasa a tu repaso.`;
  const cards = P.qs.map((q, i) => {
    const pick = P.picks[i], show = !sim && pick != null;
    return `<article class="qcard"><div class="qmeta"><span class="qn">${i + 1}</span>${areaChips(q)}${show && q.topic ? `<span class="hint">${esc(q.topic)}</span>` : ""}${P.mode === "review" && q.misses > 1 ? `<span class="hint">fallada ${q.misses} veces</span>` : ""}</div>
      <p class="stem">${esc(q.stem)}</p>
      ${optList({ ...q, id: i }, { kind: "prac", pick, correct: show ? q.correct : null, locked: show })}
      ${show ? feedback(pick === q.correct, q.explanation, q.source, q.id) : ""}</article>`;
  }).join("");
  const bar = sim
    ? `<div class="submitbar"><span class="hint">${done} de ${P.qs.length}</span><button class="btn" type="button" data-pr-finish>Terminar y ver resultado</button></div>`
    : done === P.qs.length ? `<div class="sim-card" style="margin-top:14px"><b>Listo: ${P.qs.filter((q, i) => P.picks[i] === q.correct).length} de ${P.qs.length} correctas.</b>${P.mode === "review" ? ` ${REV.due_now ? `Te quedan ${REV.due_now} para hoy.` : "Terminaste el repaso de hoy."}` : ""}<div style="margin-top:10px"><button class="btn small" type="button" data-pr-back>Volver</button></div></div>` : "";
  return `${prHead(esc(P.title), clock)}<p class="sub">${intro}</p><div class="qlist">${cards}</div>${bar}`;
}
function renderSimResult(){
  const P = PRAC, R = P.result;
  const areas = Object.entries(R.by).sort((a, b) => pctOf(a[1].ok, a[1].n) - pctOf(b[1].ok, b[1].n));
  return `${prHead("Resultado del simulacro")}
    <div class="score"><div><span>${R.ok}</span>de ${P.qs.length}</div><div class="vs">·</div><div><span>${pctOf(R.ok, P.qs.length)}%</span>${clockText(R.secs * 1000)} min</div></div>
    <h4 class="ghead">Por área (de la más floja a la mejor)</h4>
    <div class="areas">${areas.map(([k, v]) => `<div class="area-row"><div class="area-top"><b>${esc(AREAS[k] || k)}</b><span class="area-pct">${v.ok}/${v.n}</span></div><div class="bar" aria-hidden="true"><i style="width:${Math.max(pctOf(v.ok, v.n), 3)}%"></i></div></div>`).join("")}</div>
    <p class="sub" style="margin-top:12px">${R.ok < P.qs.length ? `Las ${P.qs.length - R.ok} que fallaste o dejaste en blanco quedaron en tu repaso: vuelven en 3 días.` : "Sin errores. Excelente."}</p>
    <div class="qlist">${P.qs.map((q, i) => `<article class="qcard"><div class="qmeta"><span class="qn">${i + 1}</span>${areaChips(q)}${q.topic ? `<span class="hint">${esc(q.topic)}</span>` : ""}${P.picks[i] == null ? `<span class="due">En blanco</span>` : ""}</div>
      <p class="stem">${esc(q.stem)}</p>${optList({ ...q, id: "s" + i }, { pick: P.picks[i], correct: q.correct, locked: true })}${feedback(P.picks[i] === q.correct, q.explanation, q.source, q.id)}</article>`).join("")}</div>`;
}
function renderPractice(){
  if (PRAC.screen === "areas") return renderAreas();
  if (PRAC.screen === "area") return renderArea(PRAC.area);
  if (PRAC.screen === "simsetup") return renderSimSetup();
  if (PRAC.screen === "result") return renderSimResult();
  return renderRun();
}
async function finishSim(){
  const P = PRAC; if (!P || P.mode !== "sim" || P.screen !== "run") return;
  const by = {}; let ok = 0; const wrong = [];
  P.qs.forEach((q, i) => {
    const hit = P.picks[i] === q.correct; if (hit) ok++; else wrong.push(q.id);
    (by[q.area] ||= { ok: 0, n: 0 }); by[q.area].n++; if (hit) by[q.area].ok++;
  });
  const secs = Math.round((Math.min(Date.now(), P.endsAt) - P.startedAt) / 1000);
  P.result = { ok, by, secs }; P.screen = "result";
  renderStudy(); window.scrollTo(0, 0);
  await Promise.all([
    SB.from("sim_attempts").insert({ user_id: ME.id, uni: P.uni, n: P.qs.length, correct: ok, secs, by_area: by }),
    wrong.length ? SB.rpc("review_add", { p_qids: wrong }) : null
  ]);
  loadPractice();
}
setInterval(() => {
  if (!PRAC || PRAC.mode !== "sim" || PRAC.screen !== "run") return;
  const left = PRAC.endsAt - Date.now(), el = $("simClock");
  if (el){ el.textContent = clockText(left); el.classList.toggle("low", left < 5 * 60000); }
  if (left <= 0){ toast("Se acabó el tiempo. Entregamos tu simulacro."); finishSim(); }
}, 1000);

document.addEventListener("click", async e => {
  const t = e.target;
  if (t.closest("[data-study-daily]")){ STUDY_VIEW = "daily"; renderStudy(); window.scrollTo(0, 0); return; }
  if (t.closest("[data-sd-menu]")){ STUDY_VIEW = "sd"; renderStudy(); window.scrollTo(0, 0); return; }
  if (t.closest("[data-study-hub]")){ STUDY_VIEW = null; renderStudy(); window.scrollTo(0, 0); return; }
  const pr = t.closest("[data-pr]");
  if (pr){
    const k = pr.dataset.pr;
    if (k === "review"){
      if (!REV.due_now){ toast(REV.upcoming ? `Hoy no tienes repaso. El próximo es el ${fmtS(REV.next_due)}.` : "Aún no tienes errores para repasar. Las preguntas que falles volverán a los 3 días."); return; }
      const { data, error } = await SB.rpc("review_due");
      if (error){ toast(error.message); return; }
      if (!data?.length){ toast("Hoy no tienes repaso."); return; }
      PRAC = { screen: "run", mode: "review", title: "Repaso de errores", qs: data, picks: data.map(() => null) };
    }
    if (k === "areas" || k === "refuerzo") PRAC = { screen: "areas" };
    if (k === "sim") PRAC = { screen: "simsetup", size: 50 };
    renderStudy(); window.scrollTo(0, 0); return;
  }
  if (!PRAC) return;
  if (t.closest("[data-pr-back]")){
    if (PRAC.mode === "sim" && PRAC.screen === "run" && PRAC.picks.some(x => x != null) && !confirm("¿Salir del simulacro? Se pierde lo que llevas.")) return;
    const back = PRAC.screen === "area" ? { screen: "areas" }
      : PRAC.screen === "run" && PRAC.mode === "area" && PRAC.from ? { screen: "area", area: PRAC.from }
      : PRAC.screen === "run" && (PRAC.mode === "area" || PRAC.mode === "review") ? { screen: "areas" } : null;
    PRAC = back; renderStudy(); window.scrollTo(0, 0);
    loadPractice().then(() => { if (tab === "study") renderStudy(); });
    return;
  }
  const po = t.closest("[data-pr-open]");
  if (po){ PRAC = { screen: "area", area: po.dataset.prOpen }; renderStudy(); window.scrollTo(0, 0); return; }
  const sb = t.closest("[data-pr-sub]");
  if (sb){
    const { data, error } = await SB.rpc("practice_set", { p_n: 10, p_sub: sb.dataset.prSub });
    if (error){ toast(error.message); return; }
    if (!data?.length){ toast("Todavía no hay preguntas de esa subcategoría en el banco."); return; }
    PRAC = { screen: "run", mode: "area", from: PRAC?.area || null, title: `Practicar: ${SUB_LABEL[sb.dataset.prSub]}`, qs: data, picks: data.map(() => null) };
    renderStudy(); window.scrollTo(0, 0); return;
  }
  const ar = t.closest("[data-pr-area]");
  if (ar){
    const { data, error } = await SB.rpc("practice_set", { p_n: 10, p_area: ar.dataset.prArea });
    if (error){ toast(error.message); return; }
    if (!data?.length){ toast("Todavía no hay preguntas de esa área en el banco."); return; }
    PRAC = { screen: "run", mode: "area", from: ar.dataset.prArea, title: `Practicar: ${AREAS[ar.dataset.prArea]}`, qs: data, picks: data.map(() => null) };
    renderStudy(); window.scrollTo(0, 0); return;
  }
  const sz = t.closest("[data-pr-size]");
  if (sz){ PRAC.size = Number(sz.dataset.prSize); renderStudy(); return; }
  if (t.closest("[data-pr-start]")){
    const plan = simPlan(PRAC.size || 50);
    const { data, error } = await SB.rpc("practice_set", { p_n: plan.n, p_uni: "mixto" });
    if (error){ toast(error.message); return; }
    const qs = (data || []).sort(() => Math.random() - 0.5);
    const mins = Math.max(5, Math.round(qs.length * SIM_MIN_PER_Q));
    PRAC = { screen: "run", mode: "sim", uni: "mixto", title: "Simulacro", qs, picks: qs.map(() => null), startedAt: Date.now(), endsAt: Date.now() + mins * 60000 };
    renderStudy(); window.scrollTo(0, 0); return;
  }
  if (t.closest("[data-pr-finish]")){
    const left = PRAC.picks.filter(x => x == null).length;
    if (left && !confirm(`Te faltan ${left} por responder. ¿Terminar de todas formas?`)) return;
    finishSim(); return;
  }
  const opt = t.closest('.opt[data-kind="prac"]');
  if (opt && !opt.disabled && PRAC.screen === "run"){
    const i = Number(opt.dataset.q), c = Number(opt.dataset.i), q = PRAC.qs[i];
    if (PRAC.mode !== "sim" && PRAC.picks[i] != null) return;
    PRAC.picks[i] = c;
    const y = window.scrollY; renderStudy(); window.scrollTo(0, y);
    if (PRAC.mode === "review"){
      const ok = c === q.correct;
      await SB.rpc("review_mark", { p_qid: q.id, p_ok: ok });
      REV.due_now = Math.max(0, REV.due_now - 1);
      if (PRAC.picks.every(x => x != null)){ const y2 = window.scrollY; renderStudy(); window.scrollTo(0, y2); }
    } else if (PRAC.mode === "area" && c !== q.correct){
      SB.rpc("review_add", { p_qids: [q.id] });
    }
  }
});

/* ---------- resumen de fortalezas y debilidades (Para mí) ---------- */
function strengthsBox(){
  const rows = AREA_STATS.filter(x => x.answered >= 3);
  const tot = AREA_STATS.reduce((a, x) => [a[0] + x.correct, a[1] + x.answered], [0, 0]);
  if (!tot[1]) return "";
  const by = [...rows].sort((a, b) => (b.correct / b.answered) - (a.correct / a.answered));
  const strong = by.filter(x => x.correct / x.answered >= 0.7).slice(0, 2);
  const weak = [...by].reverse().filter(x => x.correct / x.answered < 0.6).slice(0, 2);
  const last = SIM_HIST[0];
  const sset = new Set(strong.map(x => x.area)), wset = new Set(weak.map(x => x.area));
  const bars = Object.keys(AREAS).map(k => AREA_STATS.find(x => x.area === k)).filter(x => x && x.answered).map(x => {
    const p = pctOf(x.correct, x.answered);
    const tag = sset.has(x.area) ? `<span class="sw-tag ok">Fortaleza</span>` : wset.has(x.area) ? `<span class="sw-tag weak">Por reforzar</span>` : "";
    return `<div class="sw-row a-${x.area}"><span class="sw-name">${esc(AREAS[x.area] || x.area)}${tag}</span><span class="bar" aria-hidden="true"><i style="width:${Math.max(p, 3)}%"></i></span><b class="sw-pct">${p}%</b></div>`;
  }).join("");
  return `<div class="sw-box">
    <div class="sw-hd"><span class="ico-tile">${I.chart}</span><h3 style="margin:0;flex:1">Mis fortalezas y debilidades</h3></div>
    <p class="hint" style="margin:6px 0 0">${tot[0]} de ${tot[1]} correctas · ${pctOf(tot[0], tot[1])} %</p>
    <div class="sw-bars">${bars}</div>
    <p class="hint" style="margin:8px 0 0">${REV.due_now ? `Tienes ${REV.due_now} ${REV.due_now === 1 ? "pregunta" : "preguntas"} de repaso para hoy. ` : ""}${last ? `Último simulacro: ${pctOf(last.correct, last.n)} %. ` : ""}Las áreas cuentan desde 3 respuestas.</p>
    <button type="button" class="btn small" data-go-refuerzo>Reforzar en Estudiar</button>
  </div>`;
}
document.addEventListener("click", e => {
  if (!e.target.closest("[data-go-refuerzo]")) return;
  PRAC = { screen: "areas" }; setTab("study"); window.scrollTo(0, 0);
});

/* ---------- cuenta regresiva al examen ---------- */
// Fecha del examen: el primer evento del cronograma que sea examen o prueba y no haya pasado.
function examDate(u){
  const e = (u.tl || []).find(x => /examen|prueba/i.test(x[1]) && days(x[0]) >= 0);
  return e ? e[0] : null;
}
function weekdaysUntil(s){
  let n = 0; const d = new Date(today); const end = D(s);
  for (d.setDate(d.getDate() + 1); d < end; d.setDate(d.getDate() + 1)) if (d.getDay() >= 1 && d.getDay() <= 5) n++;
  return n;
}
function countdownBox(){
  const opts = DATA.filter(u => examDate(u)).sort((a, b) => D(examDate(a)) - D(examDate(b)));
  const mineIds = new Set(FOLLOWS.filter(f => f.user_id === ME.id).map(f => f.uni_id));
  const ordered = [...opts.filter(u => mineIds.has(u.id)), ...opts.filter(u => !mineIds.has(u.id))];
  const sel = cur => `<select data-target-uni aria-label="Examen al que apuntas"><option value="">${cur ? "Quitar cuenta regresiva" : "Elige un examen…"}</option>${ordered.map(u => `<option value="${u.id}"${u.id === cur ? " selected" : ""}>${esc(u.name.split(" · ")[0])} · ${fmtS(examDate(u))}</option>`).join("")}</select>`;
  const u = PROFILE.target_uni ? BY[PROFILE.target_uni] : null, ex = u ? examDate(u) : null;
  if (!u || !ex){
    return `<div class="cd-box"><div class="cd-hd"><span class="ico-tile">${I.cal}</span><h3>¿A qué examen apuntas?</h3></div><div><p class="hint">Elígelo y te mostramos cuántos días faltan y qué hacer cada semana.${u && !ex ? ` La fecha del examen de ${esc(u.name.split(" · ")[0])} ya pasó o aún no está publicada.` : ""}</p></div>${sel(u?.id)}</div>`;
  }
  const d = days(ex), wk = weekdaysUntil(ex), sats = Math.floor(wk / 5);
  const evt = u.tl.find(x => x[0] === ex)?.[1];
  return `<div class="cd-box on">
    <div class="cd-hd"><span class="ico-tile">${I.cal}</span><h3>Mi próximo examen</h3></div>
    <div class="cd-main"><span class="cd-num">${d}</span><div><b>${d === 1 ? "día" : "días"} para el examen de ${esc(u.name.split(" · ")[0])}</b></div></div>
    <div class="cd-meta"><span>${I.cal}${fmt(ex)}</span>${evt ? `<span>${I.doc}${esc(evt)}</span>` : ""}</div>
    <p class="cd-plan">Hasta ese día salen unas <b>${wk * 10}</b> preguntas diarias nuevas${sats ? ` y ${sats} ${sats === 1 ? "simulacro" : "simulacros"} de sábado` : ""}. Cada semana: termina las diarias, haz tu repaso${REV.due_now ? ` (hoy tienes ${REV.due_now})` : ""} y un simulacro en Estudiar.</p>
    <div class="cd-change"><span class="hint">Cambiar:</span>${sel(u.id)}</div>
  </div>`;
}
document.addEventListener("change", async e => {
  const s = e.target.closest("[data-target-uni]");
  if (!s) return;
  const ok = await saveProfile({ target_uni: s.value || null });
  if (ok) renderMine();
});

/* ---------- liga semanal de grupo ---------- */
async function loadLeagues(){
  const out = {};
  await Promise.all(GROUPS.map(g => SB.rpc("group_league", { p_group: g.id }).then(r => { out[g.id] = r.data || []; })));
  LEAGUE = out;
}
function leagueLeader(gid){
  const L = LEAGUE[gid] || [], top = L[0];
  if (!top || !top.correct) return "";
  const tied = L.filter(r => r.pos === 1).length;
  return ` · <span class="lead-name">🏆 ${tied > 1 ? "empate" : `${esc(top.alias)} va ganando`}</span>`;
}
function leaguePanel(gid){
  const L = LEAGUE[gid] || [];
  if (L.length < 2) return "";
  const dow = bogotaDow(), left = dow >= 1 && dow <= 5 ? 5 - dow : 0;
  const medal = p => p === 1 ? "🥇" : p === 2 ? "🥈" : p === 3 ? "🥉" : p;
  return `<div class="league"><div class="league-hd"><h4 class="ghead" style="margin:0">Liga de la semana</h4><span class="hint">${left ? `cierra en ${left} ${left === 1 ? "día" : "días"}` : dow === 5 ? "hoy cierra" : "se reinicia el lunes"}</span></div>
    <ol class="rank">${L.map(r => `<li class="${r.user_id === ME.id ? "me-row" : ""}"><span class="rpos">${r.correct ? medal(r.pos) : "–"}</span><span class="rname">${avatar(r.user_id, "sm")}${esc(r.alias)}${r.user_id === ME.id ? " (tú)" : ""}${r.wins ? ` <span class="wins" title="Semanas ganadas">🏆×${r.wins}</span>` : ""}</span><span class="rscore"><b>${r.correct}</b> <span class="hint">de ${r.answered}</span></span></li>`).join("")}</ol>
    <p class="hint" style="margin:6px 0 0">Cuentan los aciertos de las preguntas diarias de lunes a viernes. Quien termine la semana de primero gana un 🏆.</p></div>`;
}

/* ---------- quiz en vivo ---------- */
let LIVE_POLL = null;
function sdMenu(){
  return `<div class="playhead"><button class="btn ghost small" type="button" data-study-hub>Volver</button><h2 style="margin:0;flex:1">Study Date</h2></div>
    <p class="sub">Dos formas de estudiar con tus amigos. Ninguna cuenta para el ranking ni las rachas.</p>
    <div class="sd-entry"><span class="ico-tile sd-i1">${I.spin}</span><div><h3>Ruleta</h3><p class="hint">Para cuando están juntos con un solo celular: ponen sus nombres, giran la ruleta y a quien le salga responde una pregunta del banco. ResiTrack lleva el marcador.</p></div><button type="button" class="btn" data-sd-open>Abrir la ruleta</button></div>
    ${liveEntry()}`;
}
function liveEntry(){
  return `<div class="sd-entry live-entry"><div class="live-hd"><span class="ico-tile sd-i2">${I.live}</span><h3>Quiz en vivo</h3></div><div><p class="hint">Cada quien desde su celular, juntos o a distancia: todos responden la misma pregunta al tiempo y gana quien acierte más rápido. Quien lo crea comparte un código de 5 letras.</p></div>
    <form class="live-new" data-live-new>
      <label>Tema<select name="area"><option value="">Todas</option>${Object.entries(AREAS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
      <label>Preguntas<select name="n"><option>5</option><option selected>10</option><option>15</option></select></label>
      <button class="btn" type="submit">Crear quiz</button>
    </form>
    <form class="live-join fadd" data-live-join><input name="code" maxlength="5" placeholder="Código del quiz" style="text-transform:uppercase" autocomplete="off" required><button class="btn small" type="submit">Unirme</button></form>
  </div>`;
}
async function liveOpen(code){
  const { data, error } = await SB.rpc("live_join", { p_code: code });
  if (error){ toast(error.message); return; }
  LIVE = { room: data, code: code.toUpperCase(), st: null, endsAt: 0, key: "" };
  STUDY_VIEW = "sd";
  if (tab !== "study") setTab("study");
  await livePoll(true);
  if (LIVE_POLL) clearInterval(LIVE_POLL);
  LIVE_POLL = setInterval(() => { if (document.visibilityState === "visible") livePoll(); }, 1500);
}
function liveClose(){
  LIVE = null; if (LIVE_POLL) clearInterval(LIVE_POLL); LIVE_POLL = null;
  try { history.replaceState(null, "", location.pathname); } catch(e){}
  STUDY_VIEW = "sd"; renderStudy(); window.scrollTo(0, 0);
}
async function livePoll(force){
  if (!LIVE || LIVE.busy) return;
  LIVE.busy = true;
  try {
    const { data, error } = await SB.rpc("live_state", { p_room: LIVE.room });
    if (error){ toast(error.message); liveClose(); return; }
    const st = data, key = [st.status, st.idx, st.players.map(p => p.id + p.score + (p.answered ? 1 : 0)).join(","), st.mine?.choice].join("|");
    if (st.status === "q") LIVE.endsAt = Date.now() + st.left_ms;
    const changed = force || key !== LIVE.key;
    LIVE.st = st; LIVE.key = key;
    if (changed && tab === "study" && !PRAC && !SD){ const y = st.status === LIVE.lastStatus ? window.scrollY : 0; $("p-study").innerHTML = renderLive(); window.scrollTo(0, y); }
    LIVE.lastStatus = st.status;
  } finally { if (LIVE) LIVE.busy = false; }
}
setInterval(() => {
  if (!LIVE?.st || LIVE.st.status !== "q") return;
  const left = LIVE.endsAt - Date.now(), el = $("liveClock"), bar = $("liveBar");
  if (el) el.textContent = Math.max(0, Math.ceil(left / 1000));
  if (bar) bar.style.width = Math.max(0, Math.min(100, 100 * left / (LIVE.st.secs * 1000))) + "%";
  if (left < -300 && !LIVE.busy) livePoll();
}, 250);
function liveBoard(players, n){
  const medal = i => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1;
  return `<ol class="rank">${players.slice(0, n || 99).map((p, i) => `<li class="${p.id === ME.id ? "me-row" : ""}"><span class="rpos">${medal(i)}</span><span class="rname">${esc(p.alias)}${p.id === ME.id ? " (tú)" : ""}</span><span class="rscore"><b>${p.score}</b>${p.last ? ` <span class="hint">+${p.last}</span>` : ""}</span></li>`).join("")}</ol>`;
}
function renderLive(){
  const L = LIVE, st = L.st;
  const head = `<div class="playhead"><button class="btn ghost small" type="button" data-live-x>Salir</button><h2 style="margin:0;flex:1">Quiz en vivo</h2><span class="code">${esc(L.code)}</span></div>`;
  if (!st) return head + `<div class="empty">Conectando…</div>`;
  if (st.status === "lobby"){
    return `${head}<div class="live-lobby"><p class="sub" style="margin:0">Pídanle a todos que entren a <b>Estudiar → Study Date → Quiz en vivo</b> y escriban este código:</p>
      <div class="live-code" aria-label="Código ${esc(L.code)}">${[...L.code].map(ch => `<span aria-hidden="true">${esc(ch)}</span>`).join("")}</div>
      <button class="btn ghost small" type="button" data-live-share>Compartir código</button>
      <h4 class="ghead">${st.players.length} ${st.players.length === 1 ? "jugador" : "jugadores"}</h4>
      <div class="live-players">${st.players.map(p => `<span class="smate">${avatar(p.id, "sm")}<span>${esc(p.alias)}</span></span>`).join("")}</div>
      <p class="hint">${st.n} preguntas · ${st.secs} segundos cada una. Acertar da 500 puntos y hasta 500 más según la rapidez.</p>
      ${st.is_host ? `<button class="btn" type="button" data-live-next ${st.players.length < 1 ? "disabled" : ""}>Empezar quiz</button>` : `<p class="hint">Esperando a que quien creó el quiz lo empiece…</p>`}</div>`;
  }
  if (st.status === "done"){
    return `${head}<h3>Resultado final</h3>${liveBoard(st.players)}<div style="margin-top:14px"><button class="btn" type="button" data-live-x>Salir</button></div>`;
  }
  const q = st.q, answered = st.players.filter(p => p.answered).length;
  const mine = st.mine?.choice;
  const top = `<div class="live-top"><span class="hint">Pregunta ${st.idx + 1} de ${st.n}</span>${st.status === "q" ? `<span class="live-clock" id="liveClock">${Math.ceil(Math.max(0, L.endsAt - Date.now()) / 1000)}</span>` : ""}</div>
    ${st.status === "q" ? `<div class="live-bar"><i id="liveBar" style="width:${Math.max(0, Math.min(100, 100 * (L.endsAt - Date.now()) / (st.secs * 1000)))}%"></i></div>` : ""}`;
  if (st.status === "q"){
    return `${head}${top}<article class="qcard"><div class="qmeta">${areaChips(q)}</div><p class="stem">${esc(q.stem)}</p>
      ${optList({ id: st.idx, options: q.options }, { kind: "live", pick: mine ?? null, locked: mine != null })}</article>
      <p class="hint">${mine != null ? "Respuesta enviada. " : ""}${answered} de ${st.players.length} respondieron.</p>
      ${st.is_host ? `<button class="btn ghost small" type="button" data-live-next>Cerrar la pregunta ya</button>` : ""}`;
  }
  // reveal
  const counts = st.counts || [];
  const verdict = mine == null ? `<div class="fb fb-bad"><p><b>No respondiste a tiempo.</b></p></div>` : "";
  return `${head}${top}<article class="qcard"><div class="qmeta">${areaChips(q)}${st.mine ? `<span class="${st.mine.ok ? "ok-txt" : "due"}">${st.mine.ok ? `+${st.mine.pts} puntos` : "0 puntos"}</span>` : ""}</div><p class="stem">${esc(q.stem)}</p>
    ${optList({ id: "lv" + st.idx, options: q.options.map((o, i) => `${o}  (${counts[i] || 0})`) }, { pick: mine ?? null, correct: st.correct, locked: true })}
    ${verdict}${feedback(mine === st.correct, st.explanation, st.source, st.qid)}</article>
    <h4 class="ghead">Puntaje</h4>${liveBoard(st.players, 5)}
    ${st.is_host ? `<button class="btn" type="button" data-live-next>${st.idx + 1 >= st.n ? "Ver resultado final" : "Siguiente pregunta"}</button>` : `<p class="hint">Esperando la siguiente pregunta…</p>`}`;
}
document.addEventListener("submit", async e => {
  const nf = e.target.closest("[data-live-new]");
  const jf = e.target.closest("[data-live-join]");
  if (!nf && !jf) return;
  e.preventDefault();
  if (nf){
    const fd = new FormData(nf);
    const { data, error } = await SB.rpc("live_create", { p_n: Number(fd.get("n")) || 10, p_area: fd.get("area") || null, p_secs: 20 });
    if (error){ toast(error.message); return; }
    await liveOpen(data);
  } else {
    const code = String(new FormData(jf).get("code") || "").trim().toUpperCase();
    if (code.length < 4){ toast("Escribe el código del quiz."); return; }
    await liveOpen(code);
  }
});
document.addEventListener("click", async e => {
  if (!LIVE) return;
  const t = e.target;
  if (t.closest("[data-live-x]")){ if (LIVE.st && ["q","reveal"].includes(LIVE.st.status) && !confirm("¿Salir del quiz?")) return; liveClose(); return; }
  if (t.closest("[data-live-share]")){
    const url = location.origin + "/?quiz=" + LIVE.code, text = `Únete a mi quiz en vivo de ResiTrack. Código: ${LIVE.code}`;
    try { if (navigator.share) await navigator.share({ title: "Quiz en vivo", text, url }); else { await navigator.clipboard.writeText(text + " " + url); toast("Código copiado."); } } catch(err){}
    return;
  }
  if (t.closest("[data-live-next]")){
    const { error } = await SB.rpc("live_next", { p_room: LIVE.room });
    if (error){ toast(error.message); return; }
    livePoll(true); return;
  }
  const opt = t.closest('.opt[data-kind="live"]');
  if (opt && !opt.disabled && LIVE.st?.status === "q"){
    const { error } = await SB.rpc("live_answer", { p_room: LIVE.room, p_idx: LIVE.st.idx, p_choice: Number(opt.dataset.i) });
    if (error){ toast(error.message); }
    livePoll(true);
  }
});

/* ---------- portada e instrucciones ---------- */
const views = ["cover","guide","app"];
function show(v){ views.forEach(k => $(k).hidden = k !== v); window.scrollTo(0, 0); }
function showApp(){ show("app"); }
function showCover(){ show("cover"); }
// Usuario "viejo": ya vio las instrucciones en este dispositivo o ya tiene perfil.
function isReturning(){
  let seen = false; try { seen = localStorage.getItem("rt-guia") === "1"; } catch(e){}
  return seen || !!PROFILE;
}
let INSTALL_EVT = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); INSTALL_EVT = e; setupInstall(); });
window.addEventListener("appinstalled", () => { INSTALL_EVT = null; setupInstall(true); });
function setupInstall(justInstalled){
  const ua = navigator.userAgent;
  const iOS = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  const android = /android/i.test(ua);
  const standalone = justInstalled || window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  const box = $("install"); if (!box) return;
  box.classList.toggle("is-done", !!standalone);
  $("installDone").hidden = !standalone;
  $("installNow").hidden = !!standalone || !INSTALL_EVT;
  $("installIos").hidden = !!standalone || android;
  $("installAndroid").hidden = !!standalone || iOS;
  $("installDesk").hidden = !!standalone || iOS || android;
  // Ya instalada: no hay pasos que mostrar.
  if ($("installHow")) $("installHow").hidden = !!standalone;
}
// Paso de avisos debajo de la instalación. Antes de iniciar sesión solo se pide el permiso; la suscripción se completa al entrar.
async function setupPushStep(){
  const box = $("pushStep"); if (!box) return;
  const ua = navigator.userAgent;
  const iOS = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  const ok = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
  const txt = $("pushStepTxt"), btn = $("pushStepBtn");
  // El botón siempre se ve; cambia su texto y si se puede tocar según el estado real.
  const set = (t, label, on, disabled) => { txt.textContent = t; btn.textContent = label; btn.disabled = !!disabled; box.classList.toggle("is-on", !!on); };
  box.hidden = false; btn.hidden = false;
  if (iOS && !standalone) return set("En iPhone los avisos solo funcionan con la app instalada: instálala, ábrela desde el ícono y vuelve a este paso.", "Activar avisos", false, true);
  if (!ok) return set("Este navegador no admite avisos. Ábrela instalada en tu celular para activarlos.", "Activar avisos", false, true);
  if (Notification.permission === "denied") return set("Los avisos están bloqueados para ResiTrack. Actívalos en los ajustes del celular (Notificaciones) y luego toca el botón.", "Ya los activé", false, false);
  if (Notification.permission === "granted"){
    // Con sesión iniciada, además debe existir la suscripción de este celular.
    const subbed = ME ? await navigator.serviceWorker.ready.then(r => r.pushManager.getSubscription()).catch(() => null) : true;
    if (subbed) return set("Avisos activados en este celular.", "✓ Avisos activados", true, true);
    return set("Falta conectar los avisos de este celular con tu cuenta.", "Activar avisos", false, false);
  }
  set("Así te enteras cuando un amigo te rete, cuando termine un duelo y cuando cambie una convocatoria que sigues.", "Activar avisos", false, false);
}
const _setupPushStep = setupPushStep;
setupPushStep = async function(){ await _setupPushStep(); if (typeof obRefreshNext === "function" && OB_CUR === "avisos") obRefreshNext(); };
$("pushStepBtn").addEventListener("click", async () => {
  if ("Notification" in window && Notification.permission === "denied"){ setupPushStep(); return; }
  if (ME){ await enablePush(); setupPushStep(); return; }
  try {
    const perm = await Notification.requestPermission();
    if (perm === "granted"){ try { localStorage.setItem("rt-push-want", "1"); } catch(e){} toast("Listo. Al iniciar sesión quedan activados."); }
    else toast("No activaste los avisos.");
  } catch(e){ toast("No pude activar los avisos."); }
  setupPushStep();
});
$("installNow").addEventListener("click", async () => {
  if (!INSTALL_EVT) return;
  INSTALL_EVT.prompt();
  try { await INSTALL_EVT.userChoice; } catch(e){}
  INSTALL_EVT = null; setupInstall();
});
// Entrada en pasos: instalar → seguir en la app (solo desde el navegador del celular) → avisos → cuenta → verificación → cómo empezar → pestañas.
const OB_ORDER = ["p1", "app", "avisos", "cuenta", "fin", "p2", "p3"];
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || !!window.navigator.standalone;
const isMobile = () => /android|iphone|ipad|ipod/i.test(navigator.userAgent) || (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
const obFlow = () => OB_ORDER.filter(k => k !== "app" || (isMobile() && !isStandalone()));
let OB_CUR = "inicio";
function renderObAuth(){
  const box = $("obAuth"); if (!box) return;
  const next = $("obAuthNext");
  if (!ME){
    $("p-mine").innerHTML = ""; // evita ids repetidos con el formulario de Para mí
    if (box.querySelector("#authForm")) return; // no borrar lo que la persona ya escribió
    box.innerHTML = gate("Tu cuenta", "Crea tu cuenta con tu correo y una contraseña de al menos 8 caracteres.");
    signUpMode = false; $("a-switch").click(); // abre en modo "Crear cuenta"
    next.hidden = false;
  } else if (!PROFILE){
    box.innerHTML = `<div class="ob-card"><span class="ob-ic">${I.userplus}</span><div class="ob-cb"><b>Cuenta creada</b><span>${esc(ME.email || "")}. Ahora arma tu perfil para seguir.</span><button class="btn small install-now" id="createBtn" type="button">Crear mi perfil</button></div></div>`;
    next.hidden = false;
  } else {
    box.innerHTML = `<div class="ob-card"><span class="ob-ic">${I.users}</span><div class="ob-cb"><b>Cuenta y perfil listos</b><span>${esc(PROFILE.alias)} · ${esc(ME.email || "")}</span></div></div>`;
    next.hidden = false;
  }
  obRefreshNext();
}
// "Siguiente" solo se habilita cuando el paso está hecho; mientras tanto se explica qué falta.
function obNeed(k){
  const push = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
  if (k === "cuenta" && !ME) return "Crea tu cuenta para continuar.";
  if (k === "cuenta" && !PROFILE) return "Crea tu perfil para continuar.";
  if (k === "fin"){
    // Los avisos son opcionales: no bloquean.
    const missing = [...document.querySelectorAll("#guide [data-chk]")].filter(li => li.dataset.chk !== "avisos" && !li.classList.contains("chk-on")).map(li => li.textContent.toLowerCase());
    if (missing.length) return `Falta: ${missing.join(", ")}. Vuelve atrás para completarlo.`;
  }
  return "";
}
function obRefreshNext(){
  const cur = document.querySelector(`#guide [data-ob="${OB_CUR}"]`); if (!cur) return;
  const btn = cur.querySelector("[data-ob-next]"), hint = cur.querySelector(".ob-need");
  if (!btn) return;
  const need = obNeed(OB_CUR);
  btn.disabled = !!need;
  // Avisos: no se exigen, pero se recomienda activarlos.
  const push = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
  const tip = !need && push && Notification.permission !== "granted"
    ? (OB_CUR === "avisos" ? "Puedes seguir sin activarlos, pero te recomendamos hacerlo: sin avisos no te enteras cuando te reten, cuando tu racha esté en riesgo ni cuando cambie una convocatoria que sigues."
      : OB_CUR === "fin" ? "Los avisos están apagados. Puedes activarlos después desde tu perfil, en «Avisos en este dispositivo»." : "")
    : "";
  if (hint){ hint.textContent = need || tip; hint.hidden = !(need || tip); hint.classList.toggle("tip", !need && !!tip); }
}
function showStep(k){
  OB_CUR = k;
  document.querySelectorAll("#guide [data-ob]").forEach(s => s.hidden = s.dataset.ob !== k);
  const flow = obFlow(), i = flow.indexOf(k), cur = document.querySelector(`#guide [data-ob="${k}"]`);
  if (cur && i >= 0){
    cur.querySelector(".ob-dots").innerHTML = flow.map((_, j) => `<i class="${j <= i ? "on" : ""}${j === i ? " cur" : ""}"></i>`).join("");
    cur.querySelector(".ob-step").textContent = `Paso ${i + 1} de ${flow.length}`;
  }
  if (k === "p1") setupInstall();
  if (k === "app"){
    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    $("obAppTxt").textContent = iOS
      ? "Cierra Safari y abre ResiTrack desde el ícono nuevo en tu pantalla de inicio. Ahí continúas con los avisos y tu cuenta."
      : "Abre ResiTrack desde el ícono nuevo en tu pantalla de inicio. Ahí continúas con los avisos y tu cuenta.";
  }
  if (k === "avisos") setupPushStep();
  if (k === "cuenta") renderObAuth();
  if (k === "fin"){
    // Las marcas reflejan el estado real de este celular y de la cuenta.
    const done = { app: isStandalone() || !isMobile(), avisos: "Notification" in window && Notification.permission === "granted", cuenta: !!ME, perfil: !!PROFILE };
    document.querySelectorAll("#guide [data-chk]").forEach(li => li.classList.toggle("chk-on", !!done[li.dataset.chk]));
    $("obChkHint").hidden = true;
  }
  obRefreshNext();
  window.scrollTo(0, 0);
}
function obStep(dir){
  const flow = obFlow(), i = flow.indexOf(OB_CUR);
  const k = flow[i + dir];
  if (k) showStep(k); else if (dir < 0) showStep("inicio"); else finishGuide();
}
function showGuide(){ showStep("inicio"); show("guide"); }
function finishGuide(){ try { localStorage.setItem("rt-guia", "1"); } catch(e){} showApp(); renderAllTabs(); }
function goLogin(){ try { localStorage.setItem("rt-guia", "1"); } catch(e){} setTab("mine"); showApp(); }
$("startBtn").addEventListener("click", showGuide);
$("guideDone").addEventListener("click", finishGuide);
$("guideSkip").addEventListener("click", finishGuide);
document.addEventListener("click", e => {
  const go = e.target.closest("[data-ob-go]"); if (go){ showStep(go.dataset.obGo); return; }
  if (e.target.closest("[data-ob-next]")){ obStep(1); return; }
  if (e.target.closest("[data-ob-prev]")){ obStep(-1); return; }
  const bk = e.target.closest("[data-ob-back]"); if (bk){ bk.dataset.obBack === "cover" ? showCover() : showStep(bk.dataset.obBack); return; }
  if (e.target.closest("[data-ob-skip]")){ finishGuide(); return; }
  if (e.target.closest("[data-ob-login]")) goLogin();
});
$("brandBtn").addEventListener("click", showCover);
// Si se entra desde un aviso (?tab=...) o una invitación (?amigo=...), se salta la portada.
{ const qp = new URLSearchParams(location.search);
  const inv = qp.get("amigo");
  if (inv){ try { localStorage.setItem("rt-amigo", inv); } catch(e){} tab = "group"; }
  if (qp.get("quiz")) tab = "study";
  if (qp.get("tab") || inv || qp.get("quiz")) showApp(); }

setTab(tab);
boot();
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

document.addEventListener("submit", async e => {
  const f = e.target.closest("[data-report-form]");
  if (!f) return;
  e.preventDefault();
  const qid = Number(f.dataset.reportForm);
  const kind = f.querySelector("input[type=radio]:checked")?.value || "otro";
  const note = f.note.value.trim();
  const btn = f.querySelector("button[type=submit]"); btn.disabled = true;
  const { data, error } = await SB.rpc("report_question", { p_qid: qid, p_kind: kind, p_note: note || null });
  if (error){ btn.disabled = false; toast(error.message); return; }
  REPORTED.add(qid); REPORT_OPEN = null;
  const y = window.scrollY; renderCurrent(); window.scrollTo(0, y);
  toast(data === "ya" ? "Ya habías reportado esta pregunta." : "Gracias. Revisamos la pregunta y la corregimos si hay un error.");
});

/* ---------- Study Date: ruleta para estudiar en persona ---------- */
let SD = null; // { names, scores:{name:{ok,n}}, asked:[], area, rot, spinning, turn, q, pick }
const SD_COLORS = ["#0B7A69","#2563C9","#5848C2","#0F6E7A","#1E7F5C","#3A55B8","#6C4FB8","#0E5E8C","#14806E","#4060C8"];
function sdLoadNames(){ try { return JSON.parse(localStorage.getItem("rt-sd-names") || "[]").filter(x => typeof x === "string").slice(0, 12); } catch(e){ return []; } }
function sdSaveNames(){ try { localStorage.setItem("rt-sd-names", JSON.stringify(SD.names)); } catch(e){} }
function sdEntry(){
  return `<div class="sd-entry"><div><h3>Study Date</h3><p class="hint">¿Estudian juntos en persona? Pongan sus nombres en la ruleta: a quien le salga, responde una pregunta del banco de ResiTrack.</p></div><button type="button" class="btn" data-sd-open>Abrir Study Date</button></div>`;
}
function sdWheel(){
  const n = SD.names.length, R = 140, C = 150;
  if (n < 2) return `<div class="sd-wheel-empty">Agreguen al menos dos nombres para girar la ruleta.</div>`;
  const a = 360 / n, pt = (deg, r) => { const t = deg * Math.PI / 180; return [C + r * Math.sin(t), C - r * Math.cos(t)]; };
  const slices = SD.names.map((name, i) => {
    const [x1, y1] = pt(i * a, R), [x2, y2] = pt((i + 1) * a, R), large = a > 180 ? 1 : 0;
    const mid = i * a + a / 2, [tx, ty] = pt(mid, R * 0.62);
    const label = name.length > 12 ? name.slice(0, 11) + "…" : name;
    const path = n === 1 ? `<circle cx="${C}" cy="${C}" r="${R}"/>` : `<path d="M${C},${C} L${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${SD_COLORS[i % SD_COLORS.length]}"${sdAway(name) ? ' opacity=".28"' : ""}/>`;
    return `${path}<text x="${tx.toFixed(2)}" y="${ty.toFixed(2)}" transform="rotate(${mid - 90 + (mid > 180 ? 180 : 0)} ${tx.toFixed(2)} ${ty.toFixed(2)})" text-anchor="middle" dominant-baseline="middle">${esc(label)}</text>`;
  }).join("");
  return `<div class="sd-wheel-wrap"><span class="sd-pointer" aria-hidden="true"></span>
    <svg class="sd-wheel" viewBox="0 0 300 300" role="img" aria-label="Ruleta con ${n} nombres"><g id="sdRot" style="transform:rotate(${SD.rot}deg)">${slices}<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="var(--sheet)" stroke-width="3"/></g></svg><button type="button" class="sd-hub" data-sd-spin aria-label="Girar la ruleta" ${sdActive().length < 1 || SD.spinning ? "disabled" : ""}>${I.spin}<span>Girar</span></button></div>`;
}
function renderStudyDate(){
  const known = [...new Set(Object.keys(PEOPLE).filter(id => id !== ME.id && shareable(id)).map(aliasOf))].filter(a => !SD.names.includes(a)).slice(0, 10);
  const me = PROFILE?.alias;
  const quick = [me, ...known].filter(a => a && !SD.names.includes(a));
  const board = SD.names.map(nm => ({ nm, ...(SD.scores[nm] || { ok: 0, n: 0 }) })).sort((x, y) => (y.ok - x.ok) || (x.n - y.n));
  const areaChips = [["", "Todas"], ...Object.entries(AREAS)].map(([k, t]) => `<button type="button" class="count" data-sd-area="${k}" aria-pressed="${(SD.area || "") === k}">${t}</button>`).join("");
  let turn = "";
  if (SD.turn){
    const q = SD.q;
    turn = `<div class="sd-turn"><p class="sd-who">Le toca a <b>${esc(SD.turn)}</b></p>${!q ? `<div class="empty">Buscando una pregunta…</div>` : `<article class="qcard">
      <div class="qmeta">${areaChips(q)}${SD.pick != null && q.topic ? `<span class="hint">${esc(q.topic)}</span>` : ""}</div>
      <p class="stem">${esc(q.stem)}</p>
      ${optList(q, { kind: "sd", pick: SD.pick, correct: SD.pick != null ? q.correct : null, locked: SD.pick != null })}
      ${SD.pick != null ? feedback(SD.pick === q.correct, q.explanation, q.source, q.id) : `<p class="hint" style="margin:8px 0 0">Lean la pregunta en voz alta. ${esc(SD.turn)} elige su respuesta y se toca aquí.</p>`}
    </article>`}</div>`;
  }
  return `<div class="playhead"><button class="btn ghost small" type="button" data-sd-close>Salir</button><h2 style="margin:0">Study Date</h2></div>
    <p class="sub">Para estudiar en persona con un solo celular: giren la ruleta, a quien le salga responde una pregunta del banco (nunca la de hoy) y ResiTrack lleva el marcador. No cuenta para el ranking ni las rachas.</p>
    <div class="sd-names">
      <div class="sd-chips">${SD.names.map((nm, i) => `<span class="sd-name${sdAway(nm) ? " away" : ""}"><button type="button" class="sd-away" data-sd-away="${i}" aria-pressed="${sdAway(nm)}" title="${sdAway(nm) ? "Volver a incluir" : "Poner en pausa"}"><i style="background:${SD_COLORS[i % SD_COLORS.length]}"></i>${esc(nm)}${sdAway(nm) ? " · en pausa" : ""}</button><button type="button" aria-label="Quitar a ${esc(nm)}" data-sd-del="${i}">×</button></span>`).join("") || '<span class="hint">Todavía no hay nombres.</span>'}</div>
      ${SD.names.length ? `<p class="hint" style="margin:6px 0 0">Si alguien sale un momento, toca su nombre para ponerlo en pausa: la ruleta no lo escoge hasta que lo vuelvas a tocar.</p>` : ""}
      <form class="sd-add" data-sd-add><input name="nm" maxlength="24" placeholder="Nombre de quien juega" autocomplete="off"><button class="btn small" type="submit">Agregar</button></form>
      ${quick.length ? `<div class="sd-quick counts"><span class="hint">Agregar rápido:</span>${quick.map(a => `<button type="button" class="count" data-sd-quick="${esc(a)}">+ ${esc(a)}</button>`).join("")}</div>` : ""}
    </div>
    <div class="sd-areas counts"><span class="hint">Tema:</span>${areaChips}</div>
    ${sdWheel()}
    <div class="sd-actions"><button type="button" class="btn" data-sd-spin ${sdActive().length < 1 || SD.names.length < 2 || SD.spinning ? "disabled" : ""}>${SD.turn && SD.pick == null ? "Saltar y girar otra vez" : SD.turn ? "Girar otra vez" : "Girar la ruleta"}</button></div>
    ${turn}
    ${board.some(b => b.n) ? `<div class="sd-board"><h3>Marcador</h3><ol>${board.map(b => `<li><span>${esc(b.nm)}</span><b>${b.ok}</b><span class="hint">de ${b.n}</span></li>`).join("")}</ol><button type="button" class="linkish" data-sd-reset>Reiniciar marcador</button></div>` : ""}`;
}
const sdAway = nm => !!SD?.away?.includes(nm);
const sdActive = () => SD.names.filter(nm => !sdAway(nm));
function shareable(id){ return !!PEOPLE[id]?.alias; }
function sdRender(keep){ const y = window.scrollY; renderStudy(); if (keep !== false) window.scrollTo(0, y); }
async function sdFetch(){
  const seq = SD.seq = (SD.seq || 0) + 1;
  let { data } = await SB.rpc("study_date_question", { p_exclude: SD.asked, p_area: SD.area || null });
  if (!data || !data.length){ SD.asked = []; ({ data } = await SB.rpc("study_date_question", { p_exclude: [], p_area: SD.area || null })); }
  if (!SD || SD.seq !== seq) return;
  SD.q = (data && data[0]) || null;
  if (!SD.q){ toast("Todavía no hay preguntas de ese tema en el banco."); SD.turn = null; }
  else SD.asked.push(SD.q.id);
  sdRender();
}
function sdSpin(){
  const n = SD.names.length; if (n < 2 || SD.spinning) return;
  // Si se salta a alguien sin responder, cuenta como turno para el reparto (no para el marcador).
  if (SD.turn && SD.pick == null) SD.skips[SD.turn] = (SD.skips[SD.turn] || 0) + 1;
  // Le toca a alguien de quienes menos turnos llevan, sin contar a quienes están en pausa.
  const act = SD.names.map((nm, i) => i).filter(i => !sdAway(SD.names[i]));
  if (!act.length){ toast("Todos están en pausa. Toca un nombre para incluirlo."); return; }
  const turns = SD.names.map(nm => (SD.scores[nm]?.n || 0) + (SD.skips[nm] || 0));
  const min = Math.min(...act.map(i => turns[i]));
  const pool = act.filter(i => turns[i] === min);
  const idx = pool[Math.floor(Math.random() * pool.length)];
  const a = 360 / n, center = idx * a + a / 2 + (Math.random() - 0.5) * a * 0.6;
  const cur = ((SD.rot % 360) + 360) % 360, target = ((360 - center) % 360 + 360) % 360;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const from = SD.rot, dur = reduce ? 1200 : 4200;
  SD.rot = SD.rot + 360 * (reduce ? 1 : 6) + ((target - cur + 360) % 360);
  SD.spinning = true; SD.turn = null; SD.q = null; SD.pick = null;
  sdRender();
  // El render pinta la ruleta ya en la posición final: la regresamos a la inicial y animamos desde ahí.
  const g = document.getElementById("sdRot");
  const done = () => { if (!SD) return; SD.spinning = false; SD.turn = SD.names[idx]; sdRender(); sdFetch(); };
  if (!g){ done(); return; }
  g.style.transition = "none";
  g.style.transform = `rotate(${from}deg)`;
  g.getBoundingClientRect();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    g.style.transition = `transform ${dur}ms cubic-bezier(.12,.6,.12,1)`;
    g.style.transform = `rotate(${SD.rot}deg)`;
  }));
  setTimeout(() => { if (SD && SD.spinning) done(); }, dur + 150);
}
document.addEventListener("click", e => {
  const t = e.target;
  if (t.closest("[data-totop]")){ window.scrollTo({ top: 0, behavior: "smooth" }); return; }
  if (t.closest("[data-sd-open]")){ SD = { names: sdLoadNames(), scores: {}, skips: {}, away: [], asked: [], area: "", rot: 0, spinning: false, turn: null, q: null, pick: null }; if (tab !== "study") setTab("study"); else renderStudy(); window.scrollTo(0, 0); return; }
  if (!SD) return;
  if (t.closest("[data-sd-close]")){ SD = null; renderStudy(); window.scrollTo(0, 0); return; }
  const aw = t.closest("[data-sd-away]");
  if (aw){ const nm = SD.names[Number(aw.dataset.sdAway)]; SD.away = sdAway(nm) ? SD.away.filter(x => x !== nm) : [...SD.away, nm]; sdRender(); return; }
  const del = t.closest("[data-sd-del]"); if (del){ const gone = SD.names.splice(Number(del.dataset.sdDel), 1)[0]; if (gone === SD.turn){ SD.turn = null; SD.q = null; SD.pick = null; } SD.away = SD.away.filter(x => x !== gone); sdSaveNames(); sdRender(); return; }
  const qk = t.closest("[data-sd-quick]"); if (qk){ if (SD.names.length < 12 && !SD.names.includes(qk.dataset.sdQuick)){ SD.names.push(qk.dataset.sdQuick); sdSaveNames(); } sdRender(); return; }
  const ar = t.closest("[data-sd-area]"); if (ar){ SD.area = ar.dataset.sdArea; sdRender(); return; }
  if (t.closest("[data-sd-spin]")){ sdSpin(); return; }
  if (t.closest("[data-sd-reset]")){ SD.scores = {}; SD.skips = {}; SD.turn = null; SD.q = null; SD.pick = null; sdRender(); return; }
  const op = t.closest('.opt[data-kind="sd"]');
  if (op && !op.disabled && SD.q && SD.pick == null){
    SD.pick = Number(op.dataset.i);
    const sc = SD.scores[SD.turn] || (SD.scores[SD.turn] = { ok: 0, n: 0 });
    sc.n++; if (SD.pick === SD.q.correct) sc.ok++;
    sdRender();
  }
});
document.addEventListener("submit", e => {
  const f = e.target.closest("[data-sd-add]"); if (!f || !SD) return;
  e.preventDefault();
  const nm = f.nm.value.trim().replace(/\s+/g, " ");
  if (!nm) return;
  if (SD.names.includes(nm)){ toast("Ese nombre ya está en la ruleta."); return; }
  if (SD.names.length >= 12){ toast("La ruleta admite hasta 12 nombres."); return; }
  SD.names.push(nm); sdSaveNames(); sdRender();
  setTimeout(() => document.querySelector("[data-sd-add] input")?.focus(), 0);
});

/* ---------- perfil de un amigo (se abre al tocar su nombre) ---------- */
let PERSON_OPEN = null; // { id, gid }
function renderPersonDlg(){
  const d = $("pdlg"); if (!PERSON_OPEN || !PEOPLE[PERSON_OPEN.id]){ if (d.open) d.close(); return; }
  $("pdlgBody").innerHTML = personDetail(PERSON_OPEN.id, PERSON_OPEN.gid);
}
document.addEventListener("click", e => {
  const w = e.target.closest("[data-person]");
  if (w){ PERSON_OPEN = { id: w.dataset.person, gid: w.dataset.g || null }; renderPersonDlg(); $("pdlg").showModal(); return; }
  if (e.target.closest("[data-pdlg-close]")){ PERSON_OPEN = null; $("pdlg").close(); return; }
  if (e.target.closest("#pdlg [data-funfriend], #pdlg [data-retar-go]")){ PERSON_OPEN = null; $("pdlg").close(); }
});
