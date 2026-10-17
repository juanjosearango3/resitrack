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

const myFollow = id => FOLLOWS.find(f => f.uni_id === id && f.user_id === ME?.id);
const aliasOf = id => PEOPLE[id]?.alias || "Alguien";
const initials = s => (s||"?").trim().split(/\s+/).slice(0,2).map(w => w[0]).join("").toUpperCase();
function hue(s){ let h = 0; for (const c of String(s)) h = (h*31 + c.charCodeAt(0)) % 360; return h; }
function avatar(id, cls){
  const a = aliasOf(id);
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
    ? `<div class="nextline">${esc(ne[1])} <mark>${rel(days(ne[0]))}</mark>${ne[3]?" (aprox.)":""}</div>`
    : (u.next ? `<div class="nextline">${esc(u.next)}</div>` : "");
  const gap = sp && !conv.has(sp) ? `<div class="gap">Ofrece ${esc(sp)}, pero no la abrió en esta convocatoria.</div>` : "";
  const chips = OF(u).map(s => `<span class="chip${conv.has(s)?" on":""}${s===sp?" hit":""}">${esc(s)}${u.cupos&&u.cupos[s]?" ("+u.cupos[s]+")":""}</span>`).join("");
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
      <div class="facts"><span>${esc(CI(u).join(" y "))}</span><span>${u.type}</span><span>${esc(u.cycle)}</span><span>Inscripción ${esc(u.cost)}</span></div>
      ${nextHtml}${gap}<div class="chips">${chips}</div>${social}</div></summary>
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
    .map(([k,t]) => `<button class="count" data-st="${k}" aria-pressed="${statusFilter===k}"><b>${c[k]}</b>${t}</button>`).join("");
  $("others").innerHTML = OTHERS.map(o => `<li><b>${esc(o[0])}</b> · ${esc(o[1])} · ${esc(o[2])}</li>`).join("");
  $("nAll").textContent = DATA.length;
}

function pushBanner(){
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return "";
  const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  if (iOS && !standalone)
    return `<div class="banner">Para recibir avisos en iPhone, toca Compartir en Safari y elige <b>Agregar a pantalla de inicio</b>. Luego abre ResiTrack desde ahí.</div>`;
  if (Notification.permission === "granted") return "";
  if (Notification.permission === "denied")
    return `<div class="banner">Los avisos están bloqueados en este navegador. Actívalos en los ajustes del sitio si quieres recibirlos.</div>`;
  return `<div class="banner">Activa los avisos para enterarte cuando te reten, cuando termine un desafío y cuando cambie una convocatoria que te interesa.<button class="btn small" id="pushBtn">Activar avisos</button></div>`;
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
  if (!ME){ $("p-mine").innerHTML = gate("Entra a ResiTrack","Crea tu cuenta para seguir convocatorias, marcar tu avance y acompañarte con tus grupos."); return; }
  if (!PROFILE){
    $("p-mine").innerHTML = `<div class="gate"><h1>Falta tu perfil</h1><p class="lead">Dinos cómo te llamas y qué especialidades te interesan.</p><button class="btn" id="createBtn">Crear mi perfil</button></div>`;
    return;
  }
  const fol = FOLLOWS.filter(f => f.user_id === ME.id).map(f => BY[f.uni_id]).filter(Boolean).sort(sortU);
  const rec = DATA.filter(u => !myFollow(u.id) && (PROFILE.specs||[]).some(s => OF(u).includes(s))).sort(sortU);
  const recOpen = rec.filter(u => ["open","tbd"].includes(status(u).k));
  $("p-mine").innerHTML = `${pushBanner()}${feedHtml()}
    <h2>Lo que sigues</h2><p class="sub">Toca los óvalos para marcar tu avance. Tus grupos lo ven.</p>
    <div class="list">${fol.map(u => card(u,{k:"-m"})).join("") || '<div class="empty">Aún no sigues ninguna convocatoria. Abajo están las que coinciden con tus especialidades.</div>'}</div>
    <h2>Para tus especialidades</h2><p class="sub">${esc((PROFILE.specs||[]).join(", ") || "Elige especialidades en tu perfil")}. Primero las abiertas o por confirmar.</p>
    <div class="list">${(recOpen.length ? recOpen : rec.slice(0,6)).map(u => card(u,{k:"-r"})).join("") || '<div class="empty">Nada nuevo por ahora.</div>'}</div>`;
}

function personCard(id, gid){
  const p = PEOPLE[id]; if (!p) return "";
  const f = FOLLOWS.filter(x => x.user_id === id).map(x => [BY[x.uni_id], x]).filter(x => x[0]).sort((a,b) => sortU(a[0],b[0]));
  const key = (gid || "f") + ":" + id;
  const retar = id === ME.id ? "" : (RETAR_OPEN === key
    ? `<div class="retar"><span class="hint">¿Cuántas preguntas?</span>${[3,5,10].map(n => `<button class="btn small" data-retar-go="${id}" data-g="${gid||""}" data-n="${n}">${n}</button>`).join("")}<button class="btn ghost small" data-retar-x>Cancelar</button></div>`
    : `<button class="btn small retar-btn" data-retar="${key}">Retar</button>`);
  return `<div class="person"><div class="hd">${avatar(id)}<div style="flex:1"><h3>${esc(p.alias)}${id===ME.id?" (tú)":""}</h3><div class="hint">${esc(p.city||"")}</div></div></div>
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
      if (rq) return `<span class="hint">Solicitud de amistad enviada</span>`;
      return `<button class="btn ghost small" data-fadd="${id}">Agregar amigo</button>`;
    })() : (gid && FRIENDS.includes(id) ? `<span class="hint">Ya son amigos</span>` : "")}</div>`;
}

function renderFriends(){
  const code = PROFILE.friend_code || "";
  const incoming = FREQS.filter(r => r.incoming), outgoing = FREQS.filter(r => !r.incoming);
  const reqs = incoming.length ? `<div class="duebox"><h3>Solicitudes de amistad</h3><div class="chlist">${incoming.map(r =>
    `<div class="chrow"><span><b>${esc(r.alias)}</b>${r.city?` · ${esc(r.city)}`:""} quiere ser tu amigo</span><span><button class="btn small" data-faccept="${r.other}">Aceptar</button> <button class="btn ghost small" data-freject="${r.other}">Rechazar</button></span></div>`).join("")}</div></div>` : "";
  const cards = FRIENDS.map(id => personCard(id, null)).join("");
  const cs = CHALLS.filter(c => !c.group_id).slice(0, 6);
  return `${reqs}<h2>Tus amigos</h2><p class="sub">Para quienes no están en tus grupos. Tus amigos ven tu perfil y tu avance, y pueden retarte.</p>
    <div class="fcode"><div><span class="hint">Tu código de amigo</span> <span class="code">${esc(code)}</span></div><button class="btn small" id="shareCode">Compartir invitación</button></div>
    <form id="friendForm" class="fadd"><input id="f-code" maxlength="6" placeholder="Código de tu amigo" style="text-transform:uppercase" required><button class="btn small" type="submit">Agregar</button></form>
    ${outgoing.length ? `<p class="hint">Esperando respuesta de: ${outgoing.map(r => esc(r.alias)).join(", ")}.</p>` : ""}
    ${cards ? `<div class="people">${cards}</div>` : `<div class="empty">Aún no tienes amigos agregados. Comparte tu invitación o pide el código de alguien.</div>`}
    ${cs.length ? `<h4 class="ghead">Retos con amigos</h4><div class="chlist">${cs.map(chRow).join("")}</div>` : ""}`;
}

function renderGroup(){
  if (!ME){ $("p-group").innerHTML = gate("Tus amigos y grupos","Entra para agregar amigos, crear grupos y retarse."); return; }
  if (!PROFILE){ $("p-group").innerHTML = `<div class="empty">Primero crea tu perfil en la pestaña Para mí.</div>`; return; }
  const forms = `<div class="gforms">
    <form id="newGroup"><h4>Crear un grupo</h4><input id="g-name" maxlength="60" placeholder="Ej. Residencia 2027" required><button class="btn small" type="submit">Crear grupo</button></form>
    <form id="joinGroup"><h4>Unirme con un código</h4><input id="g-code" maxlength="6" placeholder="ABC123" style="text-transform:uppercase" required><button class="btn small" type="submit">Unirme</button></form>
  </div>`;
  const cards = GROUPS.map(g => {
    const ids = MEMBERS.filter(m => m.group_id === g.id).map(m => m.user_id);
    const cs = CHALLS.filter(c => c.group_id === g.id).slice(0, 6);
    return `<div class="gcard"><div class="ghd"><h3>${esc(g.name)}</h3><div><span class="hint">Código para invitar</span> <span class="code">${esc(g.code)}</span></div></div>
      <p class="sub" style="margin:10px 0">${ids.length} ${ids.length===1?"integrante":"integrantes"}. Quien tenga el código puede unirse.</p>
      <div class="people">${ids.map(id => personCard(id, g.id)).join("")}</div>
      <h4 class="ghead">Retos en este grupo</h4>${cs.length ? `<div class="chlist">${cs.map(chRow).join("")}</div>` : `<p class="hint" style="margin:0">Todavía no hay retos. Toca Retar en la tarjeta de alguien.</p>`}
      <div style="margin-top:12px"><button class="btn ghost small" data-leave="${g.id}">Salir del grupo</button></div></div>`;
  }).join("");
  if (PLAY){ $("p-group").innerHTML = renderPlay(); return; }
  if (RESULT){ $("p-group").innerHTML = renderResult(); return; }
  $("p-group").innerHTML = `${pushBanner()}${pendingBox()}${streakPanel()}${renderFriends()}
    <h2>Tus grupos</h2><p class="sub">Puedes estar en varios. Cada grupo ve tu perfil y tu avance.</p>${cards || '<div class="empty">Todavía no estás en ningún grupo. Crea uno y pásale el código a tus amigos.</div>'}${GROUPS.length ? '<h2>Otro grupo</h2>' : ''}${forms}`;
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
  renderTop();
  if (tab === "all") renderAll();
  if (tab === "mine") renderMine();
  if (tab === "group") renderGroup();
  if (tab === "study") renderStudy();
  $("nAll").textContent = DATA.length;
  updateBadges();
}
function setTab(t){
  tab = t;
  ["all","mine","study","group"].forEach(k => { $("p-"+k).hidden = k !== t; $("t-"+k).setAttribute("aria-selected", k === t); });
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
$("pform").addEventListener("submit", async e => {
  e.preventDefault();
  const alias = $("f-alias").value.trim();
  if (!alias) return;
  const okSave = await saveProfile({ alias, city: $("f-city").value.trim() || null, note: $("f-note").value.trim() || null, specs: [...pickSpecs] });
  $("dlg").close();
  if (okSave){
    toast("Perfil guardado."); renderAllTabs();
    let inv = null; try { inv = localStorage.getItem("rt-amigo"); } catch(e){}
    if (inv && inv !== PROFILE.friend_code){ try { localStorage.removeItem("rt-amigo"); } catch(e){} await addFriend(inv); }
  }
});

/* ---------- menú de cuenta ---------- */
function openMenu(){
  const m = $("menu");
  m.innerHTML = ME
    ? `<button data-act="profile">Editar mi perfil</button>
       <button data-act="push">Avisos en este dispositivo</button>
       <hr><button data-act="out">Cerrar sesión</button>
       <div class="hint" style="padding:6px 12px">${esc(ME.email||"")}</div>`
    : `<button data-act="login">Entrar o crear cuenta</button>`;
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
  if (a === "out"){ await SB.auth.signOut(); location.reload(); }
});

/* ---------- eventos de la página ---------- */
document.addEventListener("click", async e => {
  const tabBtn = e.target.closest(".tab");
  if (tabBtn){ setTab(tabBtn.dataset.tab); return; }

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
  salud_publica: "Salud pública", sistema_salud: "Sistema de salud", cultura: "Cultura general"
};
const LETTERS = ["A","B","C","D","E"];
let DAILY = [], HISTORY = [], CHALLS = [], CH_ANS = [];
let RETAR_OPEN = null, BACK_TAB = "study";
let FRIENDS = [], FREQS = [];
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
    loadRank()
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
  const list = shown.map(r => `<li class="${r.is_me ? "me-row" : ""}"><span class="rpos">${medal(r.pos)}</span><span class="rname">${esc(r.alias)}${r.is_me ? " (tú)" : ""}</span><span class="rscore"><b>${r.correct}</b> <span class="hint">${pct(r)}</span></span></li>`).join("");
  const meExtra = me && !shown.includes(me) ? `<li class="me-row sep"><span class="rpos">${me.pos}</span><span class="rname">${esc(me.alias)} (tú)</span><span class="rscore"><b>${me.correct}</b> <span class="hint">${pct(me)}</span></span></li>` : "";
  const chip = (k, v, label) => `<button class="count" data-rank-${k}="${v}" aria-pressed="${RANK[k] === v}">${label}</button>`;
  return `<div class="rank-box">
    <div class="rank-hd"><h3>Ranking</h3></div>
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

function feedback(ok, explanation, source){
  // La explicación puede venir en varios párrafos separados por una línea en blanco.
  const paras = String(explanation || "").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const body = paras.map((p, i) => `<p>${i === 0 ? `<b>${ok?"Correcta.":"Incorrecta."}</b> ` : ""}${esc(p).replace(/^OJO:/, "<b>OJO:</b>")}</p>`).join("");
  return `<div class="fb ${ok?"fb-ok":"fb-bad"}">${body}${source?`<div class="hint" style="margin-top:6px">Fuente: ${esc(source)}</div>`:""}</div>`;
}

function renderDaily(){
  if (!studyLoaded) return `<div class="empty">Cargando preguntas…</div>`;
  if (!DAILY.length) return `<div class="empty">Las preguntas de hoy todavía no están listas. Se publican cada madrugada.</div>`;
  const done = DAILY.filter(q => q.my_choice != null), ok = done.filter(q => q.is_correct).length;
  const strip = DAILY.map(q => `<i class="${q.my_choice==null?"":q.is_correct?"ok":"bad"}" title="${q.slot}"></i>`).join("");
  const head = `<div class="sheet-head"><div class="strip" aria-label="Avance de hoy">${strip}</div>
    <p class="sub" style="margin:6px 0 0">${done.length === DAILY.length
      ? `Terminaste: <b>${ok} de ${DAILY.length}</b> correctas.`
      : `${done.length} de ${DAILY.length} respondidas${done.length?`, ${ok} correctas`:""}.`}
</p></div>`;
  const cards = DAILY.map(q => {
    const answered = q.my_choice != null;
    return `<article class="qcard" id="q-${q.id}">
      <div class="qmeta"><span class="qn">${q.slot}</span><span class="chip on">${esc(AREAS[q.area]||q.area)}</span>${answered && q.topic ? `<span class="hint">${esc(q.topic)}</span>` : ""}</div>
      <p class="stem">${esc(q.stem)}</p>
      ${optList(q, { kind:"daily", pick: q.my_choice, correct: answered ? q.correct : null, locked: answered })}
      ${answered ? feedback(q.is_correct, q.explanation, q.source) : ""}
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
  const rv = aliasOf(rivalOf(c)), my = myChAns(c.id);
  if (c.status === "declined") return `<div class="chrow"><span>${c.challenger===ME.id?`${esc(rv)} rechazó tu desafío`:`Rechazaste el desafío de ${esc(rv)}`}</span></div>`;
  if (c.status === "done"){
    const th = CH_ANS.find(r => r.challenge_id === c.id && r.user_id !== ME.id), a = my?.score ?? 0, b = th?.score ?? 0;
    const verdict = a > b ? "Ganaste" : a < b ? "Perdiste" : "Empate";
    return `<div class="chrow"><span><b>${verdict}</b> contra ${esc(rv)} · ${a}–${b}</span><button class="btn ghost small" data-chres="${c.id}">Ver feedback</button></div>`;
  }
  if (my) return `<div class="chrow"><span>Respondiste (${my.score}/${c.question_ids.length}). Esperando a ${esc(rv)}.</span></div>`;
  return `<div class="chrow due"><span>${c.challenger===ME.id?`Tu desafío a ${esc(rv)}`:`<b>${esc(rv)}</b> te retó`} · ${c.question_ids.length} preguntas</span>
    <span><button class="btn small" data-chplay="${c.id}">Jugar</button>${c.opponent===ME.id?` <button class="btn ghost small" data-chdecline="${c.id}">Rechazar</button>`:""}</span></div>`;
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
  return `<h2>Desafíos</h2><p class="sub">Reta a alguien de tus grupos. Gana quien acierte más; el feedback aparece cuando los dos terminan.</p>
    ${form}<div class="chlist">${CHALLS.map(chRow).join("") || '<div class="hint">Aún no tienes desafíos.</div>'}</div>`;
}

function renderPlay(){
  const all = PLAY.qs.every((q,i) => PLAY.picks[i] != null);
  return `<div class="playhead"><button class="btn ghost small" id="chBack">Volver</button><h2 style="margin:0">Desafío contra ${esc(PLAY.rival)}</h2></div>
    <p class="sub">Elige una respuesta en cada pregunta. Verás el feedback cuando ${esc(PLAY.rival)} también termine.</p>
    <div class="qlist">${PLAY.qs.map((q,i) => `<article class="qcard"><div class="qmeta"><span class="qn">${i+1}</span><span class="chip on">${esc(AREAS[q.area]||q.area)}</span></div>
      <p class="stem">${esc(q.stem)}</p>${optList({ ...q, id: i }, { kind:"play", pick: PLAY.picks[i] })}</article>`).join("")}</div>
    <div class="submitbar"><span class="hint">${PLAY.picks.filter(x => x!=null).length} de ${PLAY.qs.length}</span><button class="btn" id="chSubmit" ${all?"":"disabled"}>Enviar respuestas</button></div>`;
}

function renderResult(){
  const r = RESULT, rv = aliasOf(r.rival);
  const verdict = r.my_score > r.their_score ? "Ganaste" : r.my_score < r.their_score ? `Ganó ${esc(rv)}` : "Empate";
  return `<div class="playhead"><button class="btn ghost small" id="chBack">Volver</button><h2 style="margin:0">${verdict}</h2></div>
    <div class="score"><div><span>${r.my_score}</span>Tú</div><div class="vs">–</div><div><span>${r.their_score}</span>${esc(rv)}</div></div>
    <div class="qlist">${r.items.map(it => `<article class="qcard"><div class="qmeta"><span class="qn">${it.idx}</span><span class="chip on">${esc(AREAS[it.area]||it.area)}</span></div>
      <p class="stem">${esc(it.stem)}</p>
      ${optList({ id: "r"+it.idx, options: it.options }, { correct: it.correct, pick: it.mine, mine: it.mine, theirs: it.theirs, rivalName: rv, locked: true })}
      ${feedback(it.mine === it.correct, it.explanation, it.source)}</article>`).join("")}</div>`;
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
  const dow = bogotaDow();
  if (dow === 0 && !DAILY.length){
    el.innerHTML = `${rankPanel()}<h2>Domingo: día de descanso</h2>
      <p class="sub">Hoy no hay preguntas. Descansa: el domingo no rompe tu racha ni tus rachas de batallas. Si quieres, igual puedes retar a alguien. Mañana vuelven las preguntas diarias.</p>`;
    return;
  }
  if (isSimDay()){
    const n = DAILY.length || 50;
    el.innerHTML = `${rankPanel()}<h2>Simulacro</h2>
      <p class="sub">El simulacro del sábado abarca las preguntas de esta semana (lunes a viernes): ${n} preguntas en un orden nuevo y con las opciones reordenadas. Cuenta tu primera respuesta y, para sumar a tu racha, debes terminarlas todas.</p>
      ${studyLoaded && !DAILY.length ? `<div class="empty">El simulacro de hoy todavía no está listo. Se arma a medianoche.</div>` : renderDaily()}`;
    return;
  }
  el.innerHTML = `${rankPanel()}<h2>Preguntas diarias: ${DIAS[dow]}</h2><p class="sub">Ocho de medicina (básicas, clínicas, quirúrgicas, salud pública y sistema de salud) y dos de cultura general. Cuenta tu primera respuesta.</p>
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
  const res = e.target.closest("[data-chres]");
  if (res){
    const { data, error } = await SB.rpc("challenge_result", { p_cid: res.dataset.chres });
    if (error){ toast(error.message); return; }
    RESULT = data; if (tab !== "group") setTab("group"); else renderGroup();
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
    const r = data?.[0], cid = PLAY.id, rival = PLAY.rival;
    PLAY = null;
    if (r?.status === "done"){
      const k = await SB.rpc("streaks_v2");
      STREAKS = Object.fromEntries((k.data || []).map(x => [x.user_id, x]));
      const rr = await SB.rpc("challenge_result", { p_cid: cid });
      RESULT = rr.data || null;
    } else {
      toast(`Acertaste ${r?.score ?? 0} de ${r?.total ?? 0}. Te avisamos el resultado cuando ${rival} termine.`);
    }
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
  if (ME && PROFILE){ await loadStudy(); renderTop(); if (tab === "study") renderStudy(); if (tab === "group") renderGroup(); }
}
try { const t = localStorage.getItem("rt-tab"); if (t && ["all","mine","study","group"].includes(t)) tab = t; } catch(e){}
// Al abrir un aviso, la URL trae la pestaña (?tab=study).
{ const t = new URLSearchParams(location.search).get("tab"); if (t && ["all","mine","study","group"].includes(t)) tab = t; }
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
function showGuide(){ $("guideSkip").hidden = !isReturning(); show("guide"); }
function finishGuide(){ try { localStorage.setItem("rt-guia", "1"); } catch(e){} showApp(); }
$("startBtn").addEventListener("click", showGuide);
$("guideDone").addEventListener("click", finishGuide);
$("guideSkip").addEventListener("click", finishGuide);
$("brandBtn").addEventListener("click", showCover);
// Si se entra desde un aviso (?tab=...) o una invitación (?amigo=...), se salta la portada.
{ const qp = new URLSearchParams(location.search);
  const inv = qp.get("amigo");
  if (inv){ try { localStorage.setItem("rt-amigo", inv); } catch(e){} tab = "group"; }
  if (qp.get("tab") || inv) showApp(); }

setTab(tab);
boot();
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
