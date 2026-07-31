# Workflow CI/CD

Ce projet utilise GitHub Actions pour la CI et l'intégration Prisma/Vercel pour le déploiement (CD). La CI ne se déclenche que sur les **pull requests** vers `develop` ou `main` — un push direct ne lance rien.

## Faire une modification

```bash
git checkout develop
git pull
git checkout -b type/nom-de-la-branche   # ex: fix/login-bug, feat/emotion-export
```

Fais tes changements, puis :

```bash
git add <fichiers>
git commit -m "type: description du changement"
git push -u origin type/nom-de-la-branche
```

## Ouvrir la pull request

```bash
gh pr create --base develop --title "type: titre court" --body "Résumé du changement"
```

Ça affiche l'URL de la PR et le lien GitHub pour ouvrir une PR à la main si besoin.

## Vérifier les checks

```bash
gh pr checks <numéro-pr>
```

Trois checks doivent passer :
- **ci** (GitHub Actions) : lint, tests (`test:run`), build
- **Vercel** : déploiement preview
- **Prisma Compute Deploy** : application des migrations sur une base preview dédiée à la branche

Si un check échoue, cliquer sur son lien (`gh pr checks` en donne l'URL) pour voir le log détaillé.

## Merger

Une fois tous les checks verts, merge la PR (bouton GitHub, ou `gh pr merge <numéro>`).

## Nettoyer après merge

```bash
git checkout develop
git pull --ff-only
git branch -d type/nom-de-la-branche
git push origin --delete type/nom-de-la-branche
```

## Notes utiles

- **Dependabot** ouvre automatiquement des PR hebdomadaires pour les mises à jour npm et GitHub Actions (`.github/dependabot.yml`).
- **Migrations Prisma** : chaque branche a sa propre base de données de preview (créée automatiquement par l'intégration Vercel). En cas d'erreur de migration bloquée sur une preview (P3009/P3018 par exemple), c'est isolé de la production (`main` branch de la base Prisma) — jamais besoin d'y toucher pour un problème de preview.
- `develop` → `main` se fait via une PR classique quand une release est prête, comme dans l'historique du repo.
