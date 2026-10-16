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
