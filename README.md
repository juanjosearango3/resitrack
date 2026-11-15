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

- `questions`: `day` = fecha de la pregunta diaria (slots 1-10; 1-50 el sábado); `day` nulo = banco. Sin políticas RLS: el navegador nunca la lee directo, así la respuesta correcta no se filtra.
- Sesión diaria (lunes a viernes) = 10 nuevas + hasta 5 de repaso. Nuevas: slots 1-2 ciencias básicas, 3-5 clínicas, 6-7 quirúrgicas, 8 salud pública, 9 sistema de salud, 10 cultura general (`fill_daily_from_bank`). Repaso: `get_daily_review()` fija para la persona, en su primer ingreso del día, hasta 5 preguntas falladas que tocan repaso (tabla `review_day`); se responden con `answer_daily_review()` y ya no aparecen en «Reforzar» ese día. La racha del día (`done_days`) exige las 10 y el repaso del día.
- RPC: `get_daily()`, `answer_daily(qid, choice)` (la primera respuesta cuenta), `my_study_history()`, `create_challenge(opponent, n)`, `get_challenge(cid)`, `submit_challenge(cid, answers[])`, `decline_challenge(cid)`, `challenge_result(cid)` (solo cuando ambos respondieron).
- Los desafíos usan preguntas del banco y de días anteriores, nunca las de hoy.
- Las 15 preguntas de cada día hábil las toma del banco la base de datos (pg_cron `resitrack-preguntas-dia`, 00:05 Bogotá, función `fill_daily_from_bank`), sin gastar uso de Claude. Tres tareas programadas semanales mantienen el banco: «Preguntas semanales ResiTrack» (35 nuevas y reportes de error), «Banco de simulacros» (reconstrucciones de exámenes y revisión de vigencia) y «Pulido del banco» (40 por corrida).
- Regla de modelos (decisión de Juanjo, 12 nov 2026): las tres tareas del banco se quedan en Opus, porque la verificación clínica nunca se sacrifica por ahorrar uso. «Actualizar ResiTrack» corre mínimo dos veces por semana y puede ir en Sonnet.
- Sábado = simulacro mixto de 50 (pg_cron `resitrack-simulacro`, 00:05 Bogotá, `build_weekly_recap()`): 25 preguntas de la semana (primero las más falladas por todos) y 25 nuevas del banco que nadie ha visto, con el reparto de áreas del examen. Todas son copias (`recap_of` = id original) con las opciones reordenadas; no entran a los desafíos ni a las diarias. `get_daily`, `answer_daily`, `my_study_history` y `leaderboard` no revelan aciertos ni explicaciones hasta que la persona termina todas (`day_finished`).
- Una pregunta a la vez: las diarias, el repaso, la práctica, el simulacro y los desafíos se pasan como diapositivas (`slides()` en `app.js`): puntos numerados para saltar, Anterior / Siguiente, deslizar o flechas del teclado. Los días anteriores y los resultados siguen en lista.
- Domingo = segunda oportunidad del simulacro: no hay preguntas nuevas, pero el simulacro del sábado sigue abierto hasta la medianoche del domingo para quien no alcanzó a terminarlo. La función `active_day()` devuelve el sábado durante el domingo; `get_daily`, `get_day`, `leaderboard`, `my_area_stats`, `streak_len`, `streaks_v2`, `my_streaks` y `streak_reminders` la usan, así que terminarlo el domingo cuenta para la racha y para el ranking de la semana, y no revela aciertos antes de terminarlo. El recordatorio de las 20:00 del sábado avisa que hay plazo hasta el domingo, y el del domingo, que es el último día.
- Sin simulacro abierto, el domingo es descanso: no hay preguntas. La racha individual solo cuenta días con preguntas, y la racha de batallas (`cal_streak_len`) salta los domingos sin batalla.

## Caso de la semana

Un paciente por semana (tablas `weekly_cases`, `case_steps`, `case_answers`): llega el lunes a urgencias o a consulta externa, de martes a jueves se le pasa revista o se le hace control, y el viernes es el desenlace. Una pregunta por día; cada paso se abre en su fecha y solo después de responder el anterior (la narrativa de un día asume la conducta correcta del anterior). Quien se atrasa puede ponerse al día hasta el domingo. No cuenta para rachas ni ranking. RPC: `get_week_case()` y `answer_case(step, choice)`. La tarea programada «Preguntas semanales ResiTrack» (martes 22:32 Bogotá, Opus), en su sección C, escribe el caso de la semana siguiente con `save_weekly_case(jsonb)` en el lunes que da `next_case_monday()`.

## Tareas programadas: permisos y horarios

- `.claude/settings.json` autoriza a WebFetch a abrir los dominios oficiales de las universidades de `data.js`. Sin esa lista, «Actualizar ResiTrack» se queda esperando un permiso que nadie responde y no puede leer las convocatorias. Al agregar una universidad nueva a `DATA`, agrega también su dominio ahí.
- El límite semanal de Juanjo se reinicia el miércoles en la madrugada (hacia las 4:00, hora de Bogotá). Las tres tareas del banco corren justo antes para gastar lo que sobró: «Preguntas semanales» martes 22:32, «Banco de simulacros» martes 23:42 y «Pulido del banco» miércoles 0:45.

## Publicación

Cada push a `main` publica la app en Vercel automáticamente (resitrackjj.vercel.app).
