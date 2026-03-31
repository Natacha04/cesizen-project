# Cesizen

Application Next.js structurée autour de l’App Router, de features métier et de Prisma.

## Structure

- `src/app` : routes, layouts et pages d’entrée.
- `src/features` : écrans et composants métier.
- `src/shared` : composants transverses et layout partagé.
- `src/lib` : infrastructure serveur et intégrations.
- `prisma` : schéma, config et migrations.

## Commandes

```bash
npm run dev
npm run lint
npm run build
```

## Prisma

Le client généré doit être écrit dans `src/generated/prisma`. Ce dossier est dérivé du schéma et ne doit pas être modifié à la main.

## Docker

Pour lancer toute la stack dans Docker, y compris l'application Next.js :

```bash
docker compose up --build
```

Services exposés :

- application : `http://localhost:3000`
- base PostgreSQL : `localhost:5432`

Le conteneur applicatif exécute `prisma migrate deploy` au démarrage avant de lancer Next.js.
