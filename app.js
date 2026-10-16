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
  return `<div class="banner">Te avisamos cuando cambie una convocatoria que sigues o cuando abra una de tus especialidades.<button class="btn small" id="pushBtn">Activar avisos</button></div>`;
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

function renderGroup(){
  if (!ME){ $("p-group").innerHTML = gate("Tus grupos","Entra para crear un grupo, invitar amigos con un código y ver en qué va cada uno."); return; }
  if (!PROFILE){ $("p-group").innerHTML = `<div class="empty">Primero crea tu perfil en la pestaña Para mí.</div>`; return; }
  const forms = `<div class="gforms">
    <form id="newGroup"><h4>Crear un grupo</h4><input id="g-name" maxlength="60" placeholder="Ej. Residencia 2027" required><button class="btn small" type="submit">Crear grupo</button></form>
    <form id="joinGroup"><h4>Unirme con un código</h4><input id="g-code" maxlength="6" placeholder="ABC123" style="text-transform:uppercase" required><button class="btn small" type="submit">Unirme</button></form>
  </div>`;
  const cards = GROUPS.map(g => {
    const ids = MEMBERS.filter(m => m.group_id === g.id).map(m => m.user_id);
    const people = ids.map(id => {
      const p = PEOPLE[id];
      if (!p) return "";
      const f = FOLLOWS.filter(x => x.user_id === id).map(x => [BY[x.uni_id], x]).filter(x => x[0]).sort((a,b) => sortU(a[0],b[0]));
      return `<div class="person"><div class="hd">${avatar(id)}<div><h3>${esc(p.alias)}${id===ME.id?" (tú)":""}</h3><div class="hint">${esc(p.city||"")}</div></div></div>
        <div class="chips">${(p.specs||[]).map(s => `<span class="chip on">${esc(s)}</span>`).join("")}</div>
        ${p.note ? `<div class="hint" style="font-size:14px">${esc(p.note)}</div>` : ""}
        <div class="mini">${f.length ? f.map(([u,x]) => {
          const i = STAGES.findIndex(s => s[0] === x.stage);
          return `<div><span>${esc(u.name.split(" · ")[0].replace("Pontificia Universidad ","P. U. ").replace("Universidad ","U. "))}</span><span class="dots" title="${esc(STAGES[i]?.[1]||"")}">${STAGES.map((s,j) => `<i class="${j<=i?"f":""}"></i>`).join("")}</span></div>`;
        }).join("") : '<span class="hint">Aún no sigue convocatorias.</span>'}</div></div>`;
    }).join("");
    return `<div class="gcard"><div class="ghd"><h3>${esc(g.name)}</h3><div><span class="hint">Código para invitar</span> <span class="code">${esc(g.code)}</span></div></div>
      <p class="sub" style="margin:10px 0">${ids.length} ${ids.length===1?"integrante":"integrantes"}. Quien tenga el código puede unirse.</p>
      <div class="people">${people}</div>
      <div style="margin-top:12px"><button class="btn ghost small" data-leave="${g.id}">Salir del grupo</button></div></div>`;
  }).join("");
  $("p-group").innerHTML = `<h2>Tus grupos</h2><p class="sub">Puedes estar en varios. Cada grupo ve tu perfil y tu avance.</p>${forms}${cards || '<div class="empty">Todavía no estás en ningún grupo. Crea uno y pásale el código a tus amigos.</div>'}`;
  $("nGroup").textContent = GROUPS.length || "";
}

function renderTop(){
  const b = $("meBtn");
  b.hidden = false;
  b.innerHTML = ME
    ? `${avatar(ME.id)}<span>${esc(PROFILE ? PROFILE.alias : "Tu perfil")}</span>`
    : `<span style="padding-left:8px">Entrar</span>`;
}
function renderAllTabs(){
  renderTop();
  if (tab === "all") renderAll();
  if (tab === "mine") renderMine();
  if (tab === "group") renderGroup();
  $("nAll").textContent = DATA.length;
  $("nGroup").textContent = GROUPS.length || "";
}
function setTab(t){
  tab = t;
  ["all","mine","group"].forEach(k => { $("p-"+k).hidden = k !== t; $("t-"+k).setAttribute("aria-selected", k === t); });
  try { localStorage.setItem("rt-tab", t); } catch(e){}
  renderAllTabs();
}

/* ---------- datos ---------- */
async function loadAll(){
  if (!ME){ PROFILE = null; PEOPLE = {}; GROUPS = []; MEMBERS = []; FOLLOWS = []; FEED = []; return; }
  const [pr, gr, mb, fl, ch] = await Promise.all([
    SB.from("profiles").select("*"),
    SB.from("groups").select("*").order("created_at"),
    SB.from("group_members").select("group_id,user_id"),
    SB.from("follows").select("user_id,uni_id,stage"),
    SB.from("changes").select("*").order("created_at",{ascending:false}).limit(40)
  ]);
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
  if (okSave){ toast("Perfil guardado."); renderAllTabs(); }
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

/* ---------- arranque ---------- */
async function boot(){
  const { data } = await SB.auth.getSession();
  ME = data.session?.user || null;
  await loadAll();
  renderAllTabs();
}
try { const t = localStorage.getItem("rt-tab"); if (t && ["all","mine","group"].includes(t)) tab = t; } catch(e){}
setTab(tab);
boot();
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
