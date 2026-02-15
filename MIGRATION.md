# Migration Guide

## UUID Generation Fix (v0.3.1)

### Problem

Die Services haben manuell UUIDs generiert (`UUID.randomUUID()`), was dazu führte, dass Spring Data R2DBC die Entities als **existierend** betrachtete und ein UPDATE statt INSERT versuchte.

**Fehler:**
```
TransientDataAccessResourceException: Failed to update table [boards];
Row with Id [...] does not exist
```

### Lösung

✅ **Implementiert:**
- Manuelle UUID-Generierung in allen Services entfernt
- Datenbank generiert UUIDs mit `DEFAULT gen_random_uuid()`
- V3 Migration aktualisiert: `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`

### Migration erforderlich

Da V3 Migration geändert wurde, **muss die Datenbank neu erstellt werden:**

**Development (PostgreSQL):**
```bash
# PostgreSQL Datenbank neu erstellen
psql -U postgres
DROP DATABASE IF EXISTS issuetracker;
CREATE DATABASE issuetracker;
\q

# Oder Flyway Repair
./gradlew :backend:flywayRepair
```

**Development (H2 - deprecated):**
```bash
rm -rf backend/data/
```

**Tests:** ✅ Keine Aktion erforderlich (Embedded PostgreSQL erstellt frische DB bei jedem Test)

---

## Upgrade to Gradle 9.3.1 / Flyway 11

Nach dem Update auf Gradle 9.3.1 und Flyway 11.1.0 kann es zu Flyway-Checksum-Fehlern kommen, wenn eine **bestehende lokale Datenbank** existiert.

### Symptom

```
FlywayValidateException: Migration checksum mismatch for migration version 3
-> Applied to database : 1545639754
-> Resolved locally    : -1767128762
```

### Lösung 1: Datenbank neu erstellen (Development)

**Empfohlen für lokale Entwicklung:**

```bash
# H2-Datenbanken löschen
rm -rf backend/data/
rm -rf backend/build/testdb*

# App neu starten
./gradlew :backend:bootRun
```

### Lösung 2: Flyway Repair (Production-like)

**Für Produktions-ähnliche Umgebungen mit Daten:**

```bash
# Flyway repair ausführen
./gradlew :backend:flywayRepair

# App starten
./gradlew :backend:bootRun
```

### Was wurde geändert?

**V3 Migration** (`V3__create_backlog_categories.sql`):
- `TIMESTAMP WITH TIME ZONE` → `TIMESTAMP` (H2-Kompatibilität)
- Hinzugefügt: `DEFAULT CURRENT_TIMESTAMP` für created_at/updated_at

### CI/CD Pipeline

✅ **Keine Aktion erforderlich**

Die CI/CD Pipeline verwendet immer frische Datenbanken und ist nicht betroffen.

### PostgreSQL Production

✅ **Funktioniert weiterhin**

`TIMESTAMP` ist PostgreSQL-kompatibel. Für Production mit PostgreSQL:
- Bestehende Datenbanken: Flyway erkennt Änderung und führt Repair automatisch durch
- Neue Deployments: Keine Probleme

## PostgreSQL UUID Generation Compatibility

### Problem

Die Migrationsdatei `V1__initial_schema.sql` verwendet `DEFAULT RANDOM_UUID()` zur automatischen UUID-Generierung.
Diese Funktion ist **H2-spezifisch** und existiert nicht in PostgreSQL.

### Lösung für PostgreSQL Deployment

**Option 1: PostgreSQL gen_random_uuid() verwenden (Empfohlen für PostgreSQL 13+)**

Ersetze in der Migrationsdatei `DEFAULT RANDOM_UUID()` mit `DEFAULT gen_random_uuid()`:

```sql
-- Boards table
CREATE TABLE boards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ...
);

-- Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ...
);
```

**Option 2: Application-Level UUID Generation (Aktuell implementiert)**

Die Services (`BoardService`, `TaskService`, `BacklogCategoryService`) generieren bereits UUIDs auf Anwendungsebene:

```kotlin
val board = Board(
    id = UUID.randomUUID(),
    name = request.name,
    ...
)
```

Daher kann `DEFAULT RANDOM_UUID()` auch komplett entfernt werden:

```sql
-- Boards table
CREATE TABLE boards (
    id UUID PRIMARY KEY,
    ...
);
```

### ✅ Lösung implementiert (v0.3.0)

**Embedded PostgreSQL für Tests:**

Die Migration wurde auf `gen_random_uuid()` umgestellt und Tests verwenden jetzt **embedded PostgreSQL** statt H2:

**Aktueller Stand:**
- ✅ **Development**: PostgreSQL mit `gen_random_uuid()`
- ✅ **Tests**: Embedded PostgreSQL (io.zonky.test:embedded-postgres) - kein Docker erforderlich
- ✅ **Production**: PostgreSQL 13+ mit `gen_random_uuid()` (nativ unterstützt)

**Vorteile:**
- Gleiche Datenbank in Tests wie in Production
- Keine H2-spezifischen Workarounds mehr
- Tests starten auf zufälligem Port (keine Konflikte)
- Kein Docker für Tests erforderlich

**Migration verwendet jetzt:**
```sql
id UUID DEFAULT gen_random_uuid() PRIMARY KEY
```

Funktioniert nativ in PostgreSQL 13+ - keine manuelle Anpassung erforderlich!
