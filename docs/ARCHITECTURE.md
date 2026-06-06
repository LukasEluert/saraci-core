# Saraci Core - Architektur

> Kanonische Architektur-Beschreibung. Beschreibt den realen Stand im Repo.
> Unsicheres ist mit `❓ TODO: pruefen` markiert. Scope: **Saraci Core** (dieses Repo).
> Saraci Desk ist eine separate App und nicht Teil dieser Doku.

## 1. Ueberblick & Zweck

Saraci Core ist die interne Plattform fuer **Lead-Recherche, Website-Analyse/Scoring und Akquise/Vertrieb**.

Zwei funktionale Saeulen:

1. **Core-Pipeline (intern/Admin):** Leads recherchieren (OSM/Overpass), Websites automatisiert pruefen (Erreichbarkeit, On-Page, PageSpeed), Scores + Potenzial berechnen, Berichte (PDF) erzeugen. Stammdaten (Branchen, Regionen, Score-Regeln) pflegen.
2. **Akquise/Vertrieb:** Zugewiesene Leads abtelefonieren, Status pflegen, Aktivitaeten und Wiedervorlagen erfassen, Handlungsbedarf flaggen und an den Admin uebergeben.

**Nutzerrollen:**

- **Admin/Owner (`role = 'admin'`):** sieht und steuert alles - Core-Pipeline plus alle Akquise-Daten.
- **Vertrieb (`role = 'vertrieb'`):** sieht nur die ihm zugewiesenen Leads (`/akquise`-Bereich), gefiltert ueber RLS.

## 2. Tech-Stack

| Bereich | Technologie |
|---------|-------------|
| Framework | Next.js **16.2.6** (App Router), React **19.2.4** |
| Sprache | TypeScript 5 |
| Styling | Tailwind CSS 4, Linear-inspiriertes Dark-Theme, `@base-ui/react` + `shadcn`-Komponenten, `lucide-react`, `sonner` (Toasts) |
| Datenbank/Auth | Supabase (Postgres + Auth + Row-Level Security), `@supabase/ssr` + `@supabase/supabase-js` |
| PDF | `@react-pdf/renderer` |
| Externe Daten | PageSpeed Insights API, OpenStreetMap/Overpass; HTML-Parsing via `cheerio` |
| Deployment | Railway (Auto-Deploy aus `main`) |
| Repo | `LukasEluert/saraci-core` |
| Node-Version | ❓ TODO: pruefen - keine `engines`-Angabe in `package.json` und keine `.nvmrc`/Railway-Config im Repo |

**Dev-Server:** `npm run dev:webpack` (siehe Abschnitt 10 - bewusst ohne Turbopack).

## 3. Verzeichnisstruktur

```
app/
  (app)/              Admin-only Route-Group (Layout-Guard: requireAdmin)
    overview/ leads/ research/ berichte/ einstellungen/
    admin/uebersicht/ admin/nutzer/ admin/zuweisung/
  akquise/            Vertrieb + Admin (Layout-Guard: requireUser), RLS-gefiltert
    page.tsx (Liste) [id]/ (Detail) heute/ (Wiedervorlagen)
  api/                Route Handlers (siehe Abschnitt 5 fuer Guards)
    leads/ research/ settings/ check-site/ calendar/[token]/
    dev/ internal/
  dev/check/          Dev-Werkzeug (in Produktion 404, siehe Abschnitt 10)
  login/ layout.tsx page.tsx
app/actions/          Server Actions ("use server")
    akquise.ts        Vertriebs-/Akquise-Aktionen (eingeloggter RLS-Client)
    admin.ts          Admin-Aktionen (Service-Role)
    core.ts reports.ts runWebsiteCheckAction.ts
components/           UI-Komponenten (akquise/, admin/, ui/, Layout/Nav)
lib/
  akquise/            Akquise-Domaene: queries, types, constants, ics
  admin/              Admin-Queries (Service-Role): listUsers, resolveUserNames, ...
  auth/               profile.ts (Guards), apiGuard.ts (requireAdminApi)
  supabase/           client.ts (Browser), server.ts (SSR), admin.ts (Service-Role), middleware.ts
  core/checks/        Website-Check-Pipeline (Fetch, Parse, Scoring, PageSpeed, Persist)
  research/           OSM-Research-Jobs, Result-Aktionen
  leads/ reports/ berichte/ settings/ overview/   weitere Domaenen-Logik
supabase/migrations/  SQL-Migrationen (manuell ausgefuehrt, siehe Abschnitt 7)
proxy.ts              Next.js-16-Middleware (Auth-Session, Route-Schutz)
```

> Hinweis: In Next.js 16 heisst die Middleware-Datei `proxy.ts` und exportiert `proxy()` (nicht mehr `middleware.ts`/`middleware()`). Die eigentliche Logik liegt in `lib/supabase/middleware.ts` (`updateSession`).

## 4. Datenmodell

Die Akquise-Tabellen (`profiles`, `activities`, `appointments`) und die RLS kamen mit Migration `010`. Die `leads`-Tabelle existiert seit `001` (Core-Pipeline) und wurde fuer Akquise erweitert.

### `leads`

| Spalte | Typ | Zweck |
|--------|-----|-------|
| `id` | uuid PK | |
| `domain` | text **NOT NULL** | Website-Domain. Bei manuell ohne Website: leerer String `''` (siehe Abschnitt 10) |
| `normalized_domain` | text | Normalisierte Domain fuer Dedupe/Lookup |
| `firma` | text | Firmenname |
| `branche` | text | Branche (Freitext) |
| `region` | text | Stadt/Region (Freitext) |
| `industry_id` / `region_id` / `source_id` | uuid FK | Referenzen auf `industries`/`regions`/`sources` |
| `has_website` | boolean | Ob ueberhaupt eine Website existiert |
| `score` | integer | Website-Score (Basis 100 minus Abzuege) |
| `potential` | text (`low`/`medium`/`high`) | Geschaeftspotenzial |
| `status` | text (default `'neu'`) | **Core-Pipeline-Status** (eigene Achse, NICHT Akquise) |
| `naechster_schritt` | text | Freitext naechster Schritt (Core) |
| `last_check_id` / `last_checked_at` | uuid / timestamptz | Letzter Website-Check |
| `created_at` / `updated_at` | timestamptz | `updated_at` via Trigger `leads_updated_at` |
| **`akquise_status`** | `lead_status` enum (default `'offen'`) | **Akquise-Status** - separate Achse vom Core-`status` (Migration 010) |
| **`assigned_to`** | uuid FK `auth.users` | Zugewiesener Vertriebsnutzer; Basis der RLS-Sichtbarkeit |
| **`created_by`** | uuid FK `auth.users` (default `auth.uid()`) | Wer den Lead angelegt hat |
| **`telefon`** | text | Telefonnummer (Akquise) |
| **`email`** | text | E-Mail (Akquise) |
| **`notiz`** | text | Freie Lead-Notiz (seit 001, von Akquise mitgenutzt) |
| **`aktion_benoetigt`** | `lead_aktion` enum (default `'keine'`) | Handlungsbedarf-Flag: `keine`/`angebot`/`brief` (Migration 011) |
| **`aktion_notiz`** | text | Notiz zum Handlungsbedarf |
| **`aktion_seit`** | timestamptz | Seit wann das Flag gesetzt ist (Wartezeit) |
| **`archiviert`** | boolean (default `false`) | Lead aus Standard-Listen ausgeblendet, wiederherstellbar (Migration 012) |
| **`bearbeitung_von`** | uuid FK `auth.users` | Wer den Lead gerade "in Arbeit" hat (NULL = niemand) (Migration 013) |
| **`bearbeitung_seit`** | timestamptz | Seit wann in Arbeit |

> Wichtig: `status` (Core) und `akquise_status` (Vertrieb) sind **bewusst getrennte Achsen**. Ebenso ist `bearbeitung_von` eine eigene Achse neben `aktion_benoetigt` - sie ueberschreiben sich nicht.

### `profiles` (Migration 010)

| Spalte | Typ | Zweck |
|--------|-----|-------|
| `id` | uuid PK -> `auth.users(id)` | 1:1 zum Auth-User |
| `role` | text (`admin`/`vertrieb`, default `vertrieb`) | Rolle, Basis fuer Guards + `is_admin()` |
| `full_name` | text | Anzeigename (z. B. fuer "in Arbeit (Name)") |
| `calendar_token` | uuid (default `gen_random_uuid()`) | Privater, revozierbarer Token fuer den ICS-Feed |
| `created_at` | timestamptz | |

Profile werden bei Signup automatisch via Trigger `on_auth_user_created` -> `handle_new_user()` angelegt (plus Backfill fuer Bestandsnutzer in 010).

### `activities` (Migration 010)

| Spalte | Typ | Zweck |
|--------|-----|-------|
| `id` | uuid PK | |
| `lead_id` | uuid FK `leads` (on delete cascade) | Zugehoeriger Lead |
| `user_id` | uuid FK `auth.users` (default `auth.uid()`) | Ersteller |
| `typ` | text (`anruf`/`mail`/`notiz`) | Aktivitaetstyp |
| `ergebnis` | text | Kurzes Ergebnis |
| `notiz` | text | Freitext |
| `created_at` | timestamptz | |

### `appointments` (Migration 010)

| Spalte | Typ | Zweck |
|--------|-----|-------|
| `id` | uuid PK | |
| `lead_id` | uuid FK `leads` (on delete cascade, nullable) | Zugehoeriger Lead (optional) |
| `user_id` | uuid FK `auth.users` (default `auth.uid()`) | Ersteller/Besitzer |
| `titel` | text | Titel der Wiedervorlage |
| `faellig_am` | timestamptz | Faelligkeit -> ICS-Feed |
| `erledigt` | boolean (default `false`) | Abgehakt? |
| `created_at` | timestamptz | |

### Enums

- **`lead_status`** (Migration 010): `offen`, `nicht_erreicht`, `rueckruf_vereinbart`, `interesse`, `angebot_raus`, `kein_interesse`, `kunde`.
- **`lead_aktion`** (Migration 011): `keine`, `angebot`, `brief`.

### Weitere Core-Tabellen (Pipeline)

`industries`, `regions`, `sources`, `score_rules`, `research_results`, `website_checks`, `lead_reports`, `core_events` (alle aus `001`/`005`). Diese gehoeren zur Core-Pipeline und werden serverseitig ueber den Service-Role-Client bedient (siehe Abschnitt 5). ❓ TODO: pruefen - fuer diese Tabellen ist im Repo **keine** RLS-Policy hinterlegt (RLS wurde in 010 nur fuer `profiles`, `leads`, `activities`, `appointments` aktiviert); der Schutz laeuft hier ausschliesslich ueber die App-Guards.

## 5. Sicherheitsmodell (load-bearing)

Das Sicherheitsmodell ist live verifiziert und tragend. Es ruht auf drei Saeulen: **RLS**, **App-Guards** und **bewusster Service-Role-Nutzung**.

### 5.1 Row-Level Security (Migration 010)

Helper:

```sql
create function is_admin() returns boolean language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;
```

RLS aktiviert auf `profiles`, `leads`, `activities`, `appointments`. Muster durchgehend: **Admin sieht/aendert alles, Vertrieb nur Eigenes/Zugewiesenes.**

| Tabelle | Policy | Regel |
|---------|--------|-------|
| `profiles` | `profiles_self_read` (select) | `id = auth.uid() OR is_admin()` |
| `profiles` | `profiles_admin_write` (update) | `is_admin()` |
| `leads` | `leads_select` | `is_admin() OR assigned_to = auth.uid()` |
| `leads` | `leads_update` | `is_admin() OR assigned_to = auth.uid()` |
| `leads` | `leads_insert` (with check) | `is_admin() OR assigned_to = auth.uid()` |
| `leads` | `leads_delete` | `is_admin()` (Vertrieb loescht nicht hart -> archiviert) |
| `activities` | `act_select` / `act_modify` / `act_delete` | `is_admin() OR user_id = auth.uid()` |
| `activities` | `act_insert` (with check) | `user_id = auth.uid()` |
| `appointments` | `app_select` / `app_modify` / `app_delete` | `is_admin() OR user_id = auth.uid()` |
| `appointments` | `app_insert` (with check) | `user_id = auth.uid()` |

Folge: Archivieren (`leads_update`) kann der Vertrieb fuer **eigene zugewiesene** Leads; "in Bearbeitung" (`bearbeitung_von`, Feld auf `leads`) wird durch dieselben `leads`-Policies abgedeckt - keine extra Policy noetig.

### 5.2 App-Guards

| Guard | Ort | Verhalten |
|-------|-----|-----------|
| `requireUser()` | `lib/auth/profile.ts` | Kein Login -> `redirect('/login')`. Layout-Guard fuer `/akquise`. |
| `requireAdmin()` | `lib/auth/profile.ts` | Kein Login -> `/login`; kein Admin -> `redirect('/akquise')`. Layout-Guard fuer die `(app)`-Group. |
| `requireAdminApi()` | `lib/auth/apiGuard.ts` | Gibt `NextResponse` mit **401** (nicht eingeloggt) bzw. **403** (kein Admin) zurueck, sonst `null`. Bewusst Statuscode statt Redirect. |
| `assertDevToken()` | `lib/core/checks/assertDevToken.ts` | Schuetzt `/api/dev/*` via `x-dev-token`-Header (`DEV_CHECK_TOKEN`). |
| `assertInternalToken()` | `lib/leads/assertInternalToken.ts` | Schuetzt `/api/internal/*` (Queue-Worker) via `INTERNAL_QUEUE_TOKEN`. |

- Die gesamte `(app)`-Route-Group ist durch `requireAdmin()` im Layout admin-only.
- `/akquise/*` ist durch `requireUser()` fuer jeden eingeloggten Nutzer offen; die Datentrennung macht RLS.
- `requireAdminApi()` sitzt auf den Admin-API-Routen (u. a. `/api/leads/*`, `/api/research/*`, `/api/settings/*`, `/api/check-site`, `/api/leads/import`, `/api/leads/bulk-check`).
- Auth-Session/Route-Redirects laufen zentral in `proxy.ts` -> `updateSession()`.

### 5.3 Service-Role-Nutzung (RLS bewusst umgangen)

`createAdminClient()` (`lib/supabase/admin.ts`) nutzt den **Service-Role-Key** und umgeht RLS vollstaendig. Das ist die sensibelste Stelle. Verteilung:

1. **Komplette Core-Pipeline (Admin-Tooling):** Research, Leads-Pipeline, Website-Checks, Reports, Settings, Overview - z. B. `lib/leads/*`, `lib/research/*`, `lib/core/checks/*`, `lib/berichte/*`, `lib/overview/queries.ts`, `app/actions/admin.ts`, `app/actions/reports.ts` und die zugehoerigen `/api/*`-Routen. **Warum erlaubt:** diese Pfade sind ausnahmslos durch `requireAdmin()` (Seiten/`(app)`) bzw. `requireAdminApi()` (API) admin-gegated.
2. **ICS-Kalender-Endpoint `app/api/calendar/[token]/route.ts`:** unauthentifiziert; der `calendar_token` IST die Auth. Service-Role loest darueber den Nutzer auf und liest dessen offene Termine. Token-Format wird per Regex validiert; ungueltig/unbekannt -> 404.
3. **Admin-Queries `lib/admin/queries.ts`:** `listUsers()` (Profile + Auth-E-Mails), `listAllLeadsForAssignment()`, `resolveUserNames()`. Erste beide laufen nur in admin-gegateten Seiten.
4. **`resolveUserNames(ids)`:** server-only Read, holt nur `full_name` zu User-IDs. Wird auch aus **Vertriebs-Kontext** (`/akquise`-Liste, Lead-Detail) aufgerufen, um den Namen fuer das "in Arbeit (Name)"-Badge anzuzeigen, weil RLS dem Vertrieb fremde `profiles`-Zeilen verbirgt. Aktuell werden ausschliesslich IDs aus bereits RLS-gefilterten Leads uebergeben. ❓ TODO: pruefen / haerten - die Funktion selbst begrenzt die uebergebenen IDs nicht (siehe Backlog "resolveUserNames absichern").

> Der Service-Role-Key darf ausschliesslich serverseitig verwendet werden und niemals an den Client gelangen. Browser-Client (`lib/supabase/client.ts`) und SSR-Client (`lib/supabase/server.ts`) nutzen ausschliesslich den Anon-Key + RLS.

## 6. Kern-Flows

### 6.1 Lead-Lebenszyklus / Akquise-Status

1. Lead entsteht ueber die Core-Pipeline (Research -> Konversion) oder wird im Akquise-Bereich manuell angelegt (`createAkquiseLead`, `assigned_to = created_by = self`).
2. Admin weist Leads zu (`/admin/zuweisung`, `assignLeads`). Ab Zuweisung sieht der Vertrieb sie via RLS.
3. Vertrieb arbeitet den Lead ab: `akquise_status` pflegen (`offen` -> `nicht_erreicht`/`rueckruf_vereinbart`/`interesse`/...), Aktivitaeten loggen, Wiedervorlagen anlegen.
4. Abschluss-Status u. a. `angebot_raus`, `kunde`, `kein_interesse`. Versehentliche/tote Leads werden **archiviert** (`archiviert = true`), nicht hart geloescht.

### 6.2 Handoff Vertrieb -> Admin (eigene Achse "in Bearbeitung")

1. **Vertrieb flaggt:** `aktion_benoetigt = 'angebot' | 'brief'` (+ `aktion_notiz`, `aktion_seit`). Erscheint in `/admin/uebersicht` ("Handlungsbedarf").
2. **Admin uebernimmt:** `leadUebernehmen()` setzt `bearbeitung_von = auth.uid()`, `bearbeitung_seit = now()` (Admin-only Action-Check). Der Lead bleibt im Handlungsbedarf sichtbar, aber klar als "in Arbeit (Name)" markiert - damit niemand ihn doppelt anfasst.
3. **Vertrieb sieht das Signal:** Badge "Angebot in Arbeit (Name)" in `/akquise`-Liste (Mobile-Karte + Desktop-Tabelle) und prominent auf der Lead-Detailseite.
4. **Abschluss:** `markAngebotRaus()` setzt `akquise_status = 'angebot_raus'`, leert `aktion_benoetigt` **und** `bearbeitung_von`/`bearbeitung_seit`. Optional `leadFreigeben()` ("doch nicht") leert nur die in-Arbeit-Markierung.

Kein Realtime/keine Benachrichtigung - die sichtbare Markierung genuegt; Aktualisierung via `revalidatePath`/Reload.

### 6.3 Kalender-ICS-Feed

- Jeder Nutzer hat einen privaten `calendar_token` (`profiles`). `SubscribeButton` bietet `webcal://`-Abo + Link-Kopieren; Token revozierbar via `regenerateCalendarToken` (Admin).
- `GET /api/calendar/[token]` (Service-Role, `force-dynamic`, `no-store`): validiert Token-Format, loest Nutzer auf, liest dessen **offene** Termine im Fenster (-7 bis +90 Tage) und baut RFC-5545-ICS (`lib/akquise/ics.ts`): `VEVENT` je Termin, UTC-Zeiten, Zeilen-Folding, Escaping, `VALARM` (-15 Min, best effort).

## 7. Migrationen

> **Regel:** Migrationen werden **manuell im Supabase-SQL-Editor** ausgefuehrt. Railway fuehrt sie **nicht** automatisch aus. Beim Deploy gilt: Code ist live, aber neue Spalten existieren erst, wenn die Migration im Supabase-Editor lief. Alle Migrationen sind idempotent (`if not exists` / `do $$ ... exception`).

| Datei | Inhalt (ein Satz) |
|-------|-------------------|
| `001_website_check_pipeline.sql` | Basis-Schema der Core-Pipeline: `leads`, `industries`, `regions`, `sources`, `score_rules` (+18 Seeds), `research_results`, `website_checks`, `lead_reports`, `core_events`. |
| `002_core_events_metadata.sql` | Zieht `core_events.metadata` (jsonb) nach. |
| `003_leads_iteration2.sql` | Lead-Pipeline: Slugs, Quelle `manual`, Indizes, `updated_at`-Trigger. |
| `005_research_osm.sql` | OSM/Overpass-Research: Jobs, Mappings, erweiterte `research_results`. |
| `006_research_result_status_actions.sql` | Status-Aktionen fuer Research-Results (uebernehmen/verwerfen). |
| `007_settings_active_columns.sql` | `active`-Spalten fuer Settings-Stammdaten. |
| `008_industry_keywords.sql` | `industries.keywords` (text[]) fuer Branchen-Auto-Erkennung. |
| `009_region_postal_codes.sql` | `regions.postal_codes` (text[]) fuer Regionen-Auto-Erkennung. |
| `010_sales_access.sql` | **Akquise-Fundament:** `lead_status`-Enum; `leads` um `akquise_status`/`assigned_to`/`created_by`/`telefon`/`email` erweitert; `profiles`/`activities`/`appointments`; `handle_new_user`-Trigger; `is_admin()` + alle RLS-Policies. |
| `011_lead_aktion.sql` | `lead_aktion`-Enum; `leads` um `aktion_benoetigt`/`aktion_notiz`/`aktion_seit`/`notiz` + Teilindex. |
| `012_archive_lead.sql` | `leads.archiviert` (boolean default false) + Teilindex; Archivieren statt Hard-Delete. |
| `013_lead_bearbeitung.sql` | `leads.bearbeitung_von`/`bearbeitung_seit` fuer den Admin-Handoff ("in Bearbeitung"). |

> Hinweis: `004` ist im Repo nicht vorhanden. ❓ TODO: pruefen, ob bewusst uebersprungen.

## 8. Environment-Variablen

Nur Namen, keine Werte. Gesetzt lokal in `.env.local` und in den **Railway Variables**.

| Variable | Wofuer |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase-Projekt-URL (Client + Server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon-Key fuer Browser-/SSR-Client (RLS gilt) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Service-Role-Key** - serverseitig, umgeht RLS. Niemals an den Client! |
| `NEXT_PUBLIC_APP_URL` | Basis-URL fuer absolute Links (u. a. ICS-Event-Links, Self-Trigger). Muss in Prod auf die echte Domain zeigen (siehe Backlog). |
| `PAGESPEED_API_KEY` | Google PageSpeed Insights API |
| `DEV_CHECK_TOKEN` | Schuetzt `/api/dev/check-url` (Header `x-dev-token`) |
| `INTERNAL_QUEUE_TOKEN` | Schuetzt `/api/internal/process-check-queue` (Queue-Worker) |

## 9. Deployment

- **Railway** deployt automatisch aus dem `main`-Branch.
- **Migrationen laufen separat** und manuell im Supabase-SQL-Editor (siehe Abschnitt 7).
- **Typischer Stolperstein:** Nach einem Merge ist der Code live, aber eine neue Spalte fehlt, weil die zugehoerige Migration im Supabase-Editor vergessen wurde -> Laufzeitfehler ("column does not exist"). Vor/nach Deploy pruefen, ob alle Migrationen eingespielt sind.
- ❓ TODO: pruefen - im Repo liegt keine Railway-Config-Datei (kein `railway.json`/`nixpacks.toml`/`Procfile`); Build/Start laufen ueber die `package.json`-Scripts (`build` -> `next build`, `start` -> `next start`).

## 10. Constraints & Gotchas (Betriebs-Wissen)

Diese Punkte stehen nicht im Code und gehen sonst verloren:

- **Dev-Server:** immer `npm run dev:webpack` (kein Turbopack). Das Default-`npm run dev` nutzt `--turbopack`.
- **`maxDuration = 120`** auf den langen API-Routen (Website-Checks, PDF-Generierung, Research, Queue, ICS u. a.) - sonst Timeout bei laenger laufenden Operationen. Aktuell in u. a. `api/leads/route.ts`, `api/leads/[id]/check/route.ts`, `api/leads/[id]/report-*.pdf/route.ts`, `api/research/start/route.ts`, `api/internal/process-check-queue/route.ts`, `api/calendar/[token]/route.ts`, `api/dev/*`. `maxDuration` gehoert auf die Route/Seite, **nicht** in `"use server"`-Action-Dateien (dort Build-Fehler).
- **`leads.domain` ist `NOT NULL`:** eine leere Website wird als leerer String `''` gespeichert (Konvention beim manuellen Anlegen). Bei Auswertungen entsprechend auf `= ''` filtern, **nicht** `IS NULL`.
- **Supabase-SQL-Editor & Connection-Pooling:** Temp Tables ueberleben das Pooling nicht zuverlaessig. Fuer Bulk-SQL daher direkte Statements verwenden, keine Staging-/Temp-Tabellen.
- **iOS-Kalender-Abos:** aktualisieren in eigenem Takt und ignorieren bei read-only-Abos oft die `VALARM`-Erinnerung -> eine minutengenaue Erinnerung am selben Tag ist nicht garantiert (siehe Backlog "Google-Relay-Kalender").
- **`/dev/check` in Produktion gesperrt:** Die Seite liefert bei `NODE_ENV === 'production'` ein `notFound()` (404); der `isDev`-Bypass in `lib/supabase/middleware.ts` greift nur ausserhalb von Produktion. `/api/dev/*` bleibt ueber `assertDevToken` geschuetzt.
