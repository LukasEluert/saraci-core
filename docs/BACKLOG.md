# Saraci Core - Backlog

> Kopierfertige Tickets fuer YouTrack. Je Ticket: **Titel · Prioritaet · Beschreibung**.
> Prioritaeten: 🔴 Kritisch · 🟡 Sollte · ⚪ Nice-to-have.
> Stand: aus Architektur-Review + Audit der letzten Tage. Keine YouTrack-Integration in dieser Umgebung verfuegbar -> bitte 1:1 als Issues anlegen.

---

## 🔴 Kritisch

### Kalender-Links zeigen auf localhost
- **Prioritaet:** 🔴 Kritisch
- **Typ:** Config (kein Code)
- **Beschreibung:** Im ICS-Feed (`/api/calendar/[token]`) werden Event-Links aus `NEXT_PUBLIC_APP_URL` gebaut; faellt die Variable weg, wird die Request-Origin genutzt. In Produktion muss `NEXT_PUBLIC_APP_URL` in den Railway Variables auf die echte Prod-URL gesetzt sein. Solange das fehlt/`localhost` ist, sind die Kalender-Links fuer den Vertrieb tot.
- **Loesung:** `NEXT_PUBLIC_APP_URL` in Railway auf die Prod-Domain setzen, Deploy, ICS-Abo gegenpruefen (Event-Link oeffnet `/akquise/[id]`).

---

## 🟡 Sollte

### resolveUserNames absichern
- **Prioritaet:** 🟡 Sollte
- **Typ:** Security / Hardening
- **Beschreibung:** `lib/admin/queries.ts > resolveUserNames(ids)` laeuft ueber den Service-Role-Client (RLS-Bypass) und ist aus Vertriebs-Kontext (`/akquise`-Liste, Lead-Detail) erreichbar, um Anzeigenamen fuer das "in Arbeit (Name)"-Badge zu holen. Aktuell werden nur IDs aus bereits RLS-gefilterten Leads uebergeben - die Funktion selbst begrenzt die IDs aber nicht.
- **Loesung:** Eng fassen: nur `full_name` von Usern aufloesen, die als `bearbeitung_von`/`assigned_to` auf einem fuer den Aufrufer sichtbaren Lead stehen (serverseitig herleiten, keine client-uebergebenen UUIDs vertrauen). Sicherstellen, dass kein Endpoint die ID-Liste vom Client uebernimmt.

### Lead-Stammdaten editierbar (C-1)
- **Prioritaet:** 🟡 Sollte
- **Typ:** Feature / CRUD-Luecke
- **Beschreibung:** Nach dem Anlegen lassen sich `firma`/`branche`/`region`/`website` (Domain) nicht mehr aendern; nur Telefon/E-Mail/Notiz/Status sind editierbar. Tippfehler bleiben stehen.
- **Loesung:** Editierbare Stammdaten-Card auf der Lead-Detailseite (`/akquise/[id]`) analog zu `LeadContactCard`, RLS-konform (`leads_update`).

### Nutzer deaktivierbar (C-4)
- **Prioritaet:** 🟡 Sollte
- **Typ:** Feature / Admin
- **Beschreibung:** Nutzer koennen angelegt und in der Rolle geaendert werden, aber nicht deaktiviert/gesperrt. Ausgeschiedene Mitarbeiter behalten Zugang.
- **Loesung:** Admin-Aktion "Deaktivieren" (Supabase Auth-Ban / Sperre) in `components/admin/UsersAdmin.tsx` + `app/actions/admin.ts`.

### Brand-/Logo-Link rollenabhaengig (D-1)
- **Prioritaet:** 🟡 Sollte
- **Typ:** UX
- **Beschreibung:** Der Marken-Anker (Sidebar-Logo) verlinkt fix auf `/overview`. Fuer Vertrieb ist `/overview` admin-gegated -> `requireAdmin` leitet auf `/akquise` um (Redirect-Flash). Das Mobile-TopBar-Logo ist zudem kein Link.
- **Loesung:** Brand-Link rollenabhaengig: Admin -> `/overview`, Vertrieb -> `/akquise`; Mobile-Logo ebenfalls verlinken.

---

## ⚪ Nice-to-have

### Wiedervorlagen editierbar (C-3)
- **Prioritaet:** ⚪ Nice-to-have
- **Typ:** Feature / CRUD
- **Beschreibung:** Wiedervorlagen (`appointments`) lassen sich anlegen, abhaken und loeschen, aber Titel/Datum nicht aendern - Verschieben = loeschen + neu.
- **Loesung:** Edit-Modus bzw. "Datum aendern" (`appointments`-Update, RLS `app_modify`).

### Admin-Archiv-Ansicht (C-5)
- **Prioritaet:** ⚪ Nice-to-have
- **Typ:** Feature / Admin
- **Beschreibung:** Archivierte Leads sind nur in der Vertriebs-Liste ueber `?archiv=1` sichtbar; in der Admin-Uebersicht (`/admin/uebersicht`) gibt es keinen zentralen Blick aufs Archiv.
- **Loesung:** Optionaler "inkl. Archiv"-Filter in der Admin-Uebersicht.

### Google-Relay-Kalender (Option)
- **Prioritaet:** ⚪ Nice-to-have
- **Typ:** Option / nur bei Bedarf
- **Beschreibung:** iOS aktualisiert read-only-ICS-Abos in eigenem Takt und ignoriert die `VALARM`-Erinnerung oft -> minutengenaue Erinnerung am selben Tag nicht garantiert.
- **Loesung (nur falls im Echtbetrieb noetig):** Zuverlaessiger Weg ueber einen dedizierten Google-Kalender (Events per API schreiben), statt reinem ICS-Abo.

### "Heute"-/Morgen-Dashboard (Option)
- **Prioritaet:** ⚪ Nice-to-have
- **Typ:** Option / nur bei Bedarf
- **Beschreibung:** Gebuendelte Tagesuebersicht (faellige Wiedervorlagen + Handlungsbedarf + heisse Leads) an einer Stelle.
- **Loesung (nur falls das taegliche Draufschauen auf `/admin/uebersicht` im Alltag nicht reicht):** kompaktes Tages-Dashboard bauen.

---

## Weitere Beobachtungen (beim Lesen aufgefallen)

### Hard-Delete von Leads ohne Bestaetigung pruefen (U-2)
- **Prioritaet:** 🟡 Sollte
- **Typ:** UX / Security-nah
- **Beschreibung:** Der Akquise-Bereich nutzt Archivieren statt Hard-Delete; der harte Lead-Delete laeuft weiter ueber die Admin-Pipeline (`DELETE /api/leads/[id]`, RLS `leads_delete` = Admin). Pruefen, ob im Admin-UI ein Bestaetigungs-Dialog davorsitzt.
- **Loesung:** Confirm-Dialog fuer den Lead-Hard-Delete im Admin-UI sicherstellen.

### Aktivitaeten nicht editierbar (C-2)
- **Prioritaet:** ⚪ Nice-to-have
- **Typ:** Feature / CRUD
- **Beschreibung:** Aktivitaeten (`activities`) sind anlegbar und loeschbar, aber nicht editierbar. Ggf. bewusst als append-only Verlauf akzeptieren.
- **Loesung:** Optional Inline-Edit, oder bewusst so lassen.

### Doppelter Redirect nach Login fuer Vertrieb (D-2)
- **Prioritaet:** ⚪ Nice-to-have
- **Typ:** UX
- **Beschreibung:** Nach Login wird auf `/overview` geleitet (`LoginForm` + `proxy.ts`); Vertrieb wird von dort per Guard weiter auf `/akquise` umgeleitet (doppelter Redirect/Flash).
- **Loesung:** Ziel nach Login rollenabhaengig waehlen (Vertrieb direkt `/akquise`).

### Migration 004 fehlt im Repo
- **Prioritaet:** ⚪ Nice-to-have
- **Typ:** Doku/Klarheit
- **Beschreibung:** Die Migrationsnummern springen von `003` auf `005`; `004` ist nicht im Repo.
- **Loesung:** Klaeren, ob `004` bewusst uebersprungen wurde, und ggf. in `docs/ARCHITECTURE.md` festhalten.
