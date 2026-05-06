# Plan de test — Cesizen

## 1. Objectif

Définir la stratégie de test du projet Cesizen afin de garantir la qualité des fonctionnalités livrées et la conformité avec les exigences du cahier des charges.

---

## 2. Périmètre

### Fonctionnalités couvertes

| Fonctionnalité       | Module                  | Inclus dans ce plan |
|----------------------|-------------------------|---------------------|
| Authentification     | LoginForm, RegisterForm | ✅                  |
| Shell d'auth         | AuthShell               | ✅                  |
| Tracker d'émotions   | EmotionTrackerPage      | 🔜 Prévu            |
| Calendrier émotions  | EmotionCalendar         | ✅                  |
| Page Articles        | ArticlesPage            | ✅                  |
| Page À propos        | AboutPage               | 🔜 Prévu            |
| Page d'accueil       | HomePage                | 🔜 Prévu            |
| API REST (back-end)  | Routes Next.js / Prisma | 🔜 Prévu            |

### Hors périmètre (version actuelle)

- Tests de performance / charge
- Tests de compatibilité cross-browser (couvert manuellement)
- Tests d'accessibilité automatisés (WCAG)

---

## 3. Environnements de test

| Environnement | Description                              | URL / accès               |
|---------------|------------------------------------------|---------------------------|
| Local         | Machine développeur, `npm run dev`       | http://localhost:3000     |
| Test unitaire | Vitest + JSDOM (pas de serveur requis)   | `npx vitest run`          |
| Base de données test | PostgreSQL via Docker Compose     | `localhost:5432`          |

---

## 4. Outils et frameworks

| Outil                         | Version  | Rôle                                      |
|-------------------------------|----------|-------------------------------------------|
| Vitest                        | 4.1.2    | Runner de tests unitaires                 |
| @testing-library/react        | —        | Rendu et requêtes DOM dans les tests      |
| @testing-library/user-event   | —        | Simulation d'interactions utilisateur     |
| @testing-library/jest-dom     | —        | Matchers DOM (`toBeInTheDocument`, etc.)  |
| JSDOM                         | —        | Environnement navigateur simulé           |

---

## 5. Types de tests

### 5.1 Tests unitaires (en place)

Testent chaque composant React de manière isolée. Les dépendances externes (Next.js router, fetch, headers) sont simulées avec `vi.mock`.

**Exécution :**
```bash
npx vitest run
```

**Mode watch (développement) :**
```bash
npx vitest
```

### 5.2 Tests d'intégration (à prévoir)

Testent les flux complets entre composants et API (ex. : soumission du formulaire → appel API → réponse DB). Non implémentés dans cette version.

### 5.3 Tests de recette (manuels)

Validés par un testeur fonctionnel selon le cahier de recette. Couvrent les scénarios utilisateur de bout en bout dans un environnement proche de la production.

---

## 6. Stratégie de couverture

Chaque composant couvert par les tests unitaires doit comporter :

- Au moins **1 test de cas normal (✅)** — le composant fonctionne dans les conditions attendues
- Au moins **1 test de cas d'échec (❌)** — le composant gère correctement une entrée invalide ou un état d'erreur

---

## 7. Critères d'entrée

- Le code source est compilé sans erreur TypeScript (`npx tsc --noEmit`)
- Les dépendances sont installées (`npm install`)
- Les variables d'environnement sont configurées (`.env`)

## 8. Critères de sortie (définition du "terminé")

- Tous les tests unitaires passent (`Tests: X passed`)
- Aucune régression introduite dans les tests existants
- Les scénarios de recette sont validés manuellement sans anomalie bloquante

---

## 9. Risques identifiés

| Risque                                              | Probabilité | Impact  | Mitigation                                     |
|-----------------------------------------------------|-------------|---------|------------------------------------------------|
| Divergence entre mock et comportement réel de l'API | Moyen       | Élevé   | Ajouter des tests d'intégration avec vraie DB  |
| Composants MUI non testables dans JSDOM             | Faible      | Moyen   | Tester les comportements, pas le style         |
| Données seedées non représentatives de la prod      | Faible      | Faible  | Utiliser des fixtures dédiées aux tests        |

---

## 10. Responsabilités

| Rôle    | Responsabilités                                                                                   |
|---------|---------------------------------------------------------------------------------------------------|
| Natacha | Écriture et exécution des tests unitaires · Exécution du cahier de recette · Validation du PV de recette · Décision de mise en prod |
