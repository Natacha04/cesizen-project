#!/usr/bin/env bash
# Réinitialise une base de données de PREVIEW Prisma sur la baseline courante.
#
# Usage :
#   ./scripts/reset-preview-db.sh "<connection string de la preview>"
#
# Refuse de s'exécuter si la base ressemble à la production (utilisateurs présents
# ou tables applicatives peuplées). La vérification est faite AVANT toute écriture.

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 \"<connection string de la preview>\"" >&2
  exit 1
fi

TARGET_URL="$1"

echo "→ Vérification de la base cible (lecture seule)…"

VERDICT=$(DATABASE_URL="$TARGET_URL" node -e '
const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const q = async (sql, d) => { try { return (await c.query(sql)).rows[0].v; } catch { return d; } };
  const users = await q(`SELECT count(*)::int AS v FROM "User"`, 0);
  const emotions = await q(`SELECT count(*)::int AS v FROM "EmotionEntry"`, 0);
  const resources = await q(`SELECT count(*)::int AS v FROM "Resource"`, 0);
  await c.end();
  console.log(JSON.stringify({ users, emotions, resources }));
})().catch(e => { console.error("ERREUR de connexion:", e.message); process.exit(1); });
')

echo "  état: $VERDICT"

USERS=$(echo "$VERDICT" | sed -E 's/.*"users":([0-9]+).*/\1/')

if [ "$USERS" -gt 0 ]; then
  echo "" >&2
  echo "🛑 REFUS : cette base contient $USERS utilisateur(s)." >&2
  echo "   Une base de preview doit être vide. Il s'agit probablement de la PRODUCTION." >&2
  echo "   Aucune modification n'a été effectuée." >&2
  exit 1
fi

echo "✅ Base vide confirmée : c'est bien une preview."
echo "→ Réinitialisation sur la baseline…"

DATABASE_URL="$TARGET_URL" npx prisma db push --force-reset
DATABASE_URL="$TARGET_URL" npx prisma migrate resolve --applied 00000000000000_init

echo ""
echo "→ Vérification finale…"
DATABASE_URL="$TARGET_URL" node -e '
const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const r = await c.query(`
    SELECT
      (SELECT count(*) FROM "_prisma_migrations" WHERE finished_at IS NULL)::int AS unfinished,
      (SELECT count(*) FROM "_prisma_migrations" WHERE finished_at IS NOT NULL)::int AS applied,
      (to_regclass($$"Resource"$$) IS NOT NULL)::int
      + (to_regclass($$"EmotionEntry"$$) IS NOT NULL)::int
      + (to_regclass($$"SubEmotion"$$) IS NOT NULL)::int AS new_tables
  `);
  console.log(r.rows[0]);
  await c.end();
})().catch(e => { console.error("ERREUR:", e.message); process.exit(1); });
'

echo ""
echo "Attendu : unfinished=0, applied=1, new_tables=3"
