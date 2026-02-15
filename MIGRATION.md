# Migration Guide

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
