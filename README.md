# ResiTrack

Radar de convocatorias de especializaciones médico-quirúrgicas en Colombia, con cuentas, grupos y avisos push.

## Cómo está armado

- **Sitio estático** (sin build) publicado en Vercel: `index.html`, `styles.css`, `app.js`, `sw.js`, `manifest.webmanifest`.
- **`data.js`**: el contenido del radar (`DATA`, `OTHERS`, `ALIAS`). Es lo único que cambia la actualización automática.
- **Supabase** (proyecto `ResiTrack`, ref `foujwctiqyykhnmqbdkh`):
  - `profiles`, `groups`, `group_members`, `follows`: personas, grupos y avance. RLS: cada quien ve solo a la gente con la que comparte grupo.
  - `unis`: registro de ids de universidades (para la llave foránea de `follows`).
  - `changes`: bitácora de novedades. Insertar aquí dispara los avisos.
  - `push_subs`, `notified`: suscripciones push y envíos ya hechos.
  - `meta` (lectura pública) y `app_secrets` (solo service role).
  - RPC `create_group(p_name)` y `join_group(p_code)`.
  - Función `notify` (código en `supabase/functions/notify`), llamada cada 10 min por pg_cron.

## Registrar una novedad

```sql
insert into public.changes (uni_id, kind, title, summary, specs)
values ('ces', 'fecha', 'CES amplió inscripciones', 'Nuevo cierre: 15 nov', array['Cirugía Plástica']);
```

Avisa a quien sigue `ces` y a quien tiene alguna de esas especialidades en su perfil.

## Campos de cada universidad en `data.js`

`id, name, city|cities, type, cycle, cost, specs (abiertas en la convocatoria), oferta (oferta completa), cupos, insc, final, finalEst, tbd, next, tl ([fechaISO, etiqueta, fin?, estimada?]), exam, weights ([etiqueta, %]), weightNote, req, tips, src ([etiqueta, url])`.

## Estudiar: preguntas diarias y desafíos

- `questions`: `day` = fecha de la pregunta diaria (slots 1-15; 1-50 el sábado); `day` nulo = solo banco de desafíos. Sin políticas RLS: el navegador nunca la lee directo, así la respuesta correcta no se filtra.
- Reparto diario (15): slots 1-3 ciencias básicas, 4-7 clínicas, 8-10 quirúrgicas, 11-12 salud pública, 13 sistema de salud, 14-15 cultura general.
- RPC: `get_daily()`, `answer_daily(qid, choice)` (la primera respuesta cuenta), `my_study_history()`, `create_challenge(opponent, n)`, `get_challenge(cid)`, `submit_challenge(cid, answers[])`, `decline_challenge(cid)`, `challenge_result(cid)` (solo cuando ambos respondieron).
- Los desafíos usan preguntas del banco y de días anteriores, nunca las de hoy.
- Una tarea programada (rutina «Preguntas diarias ResiTrack») escribe las 15 preguntas de lunes a viernes, cada madrugada (hora de Bogotá).
- Sábado = simulacro: pg_cron (`resitrack-simulacro`, 00:05 Bogotá) llama a `build_weekly_recap()`, que copia las preguntas de lunes a viernes (hasta 50, slots 1-50) en orden aleatorio y con las opciones reordenadas. Las copias llevan `recap_of` = id original y no entran a los desafíos. En el simulacro, `get_daily`, `answer_daily`, `my_study_history` y `leaderboard` no revelan aciertos ni explicaciones hasta que la persona termina todas (`day_finished`). Si la semana trae más de 50, mitad las más falladas y mitad al azar; si trae menos, completa con semanas anteriores (mitad falladas, mitad al azar).
- Domingo = descanso: no hay preguntas. La racha individual solo cuenta días con preguntas, y la racha de batallas (`cal_streak_len`) salta los domingos sin batalla.

## Publicación

Cada push a `main` publica la app en Vercel automáticamente (resitrackjj.vercel.app).
