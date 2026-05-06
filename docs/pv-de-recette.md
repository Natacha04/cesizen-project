# Procès-Verbal de recette — Cesizen

---

## Informations générales

| Champ               | Valeur                              |
|---------------------|-------------------------------------|
| Projet              | Cesizen                             |
| Version testée      | Branche `feature/test`             |
| Date de recette     | 04/05/2026                          |
| Environnement       | Local — `http://localhost:3000`     |
| Base de données     | PostgreSQL via Docker               |

---

## Participants

| Nom     | Rôle                                                        | 
|---------|-------------------------------------------------------------|
| Natacha | Développeur · Testeur · Chef de projet · Client            

---

## 1. Résultats des tests unitaires automatisés

> Exécutés le 04/05/2026 avec `npx vitest run`

| Fichier de test                            | Tests | Passés | Échoués | Durée   |
|--------------------------------------------|-------|--------|---------|---------|
| LoginForm.test.tsx                         | 4     | 4      | 0       | ~300ms  |
| RegisterForm.test.tsx                      | 9     | 9      | 0       | ~850ms  |
| AuthShell.test.tsx                         | 4     | 4      | 0       | ~60ms   |
| EmotionTrackerPage.test.tsx                | 8     | 8      | 0       | ~490ms  |
| EmotionCalendar.test.tsx                   | 7     | 7      | 0       | ~600ms  |
| ArticlesPage.test.tsx                      | 4     | 4      | 0       | ~100ms  |
| **Total**                                  | **36**| **36** | **0**   | **2.5s**|

**Résultat :** ✅ 100% des tests unitaires passent

---

## 2. Résultats des tests de recette manuels

> Réalisés selon le cahier de recette — à compléter par le recetteur

| ID    | Scénario                     | Résultat    | Anomalies | Sévérité |
|-------|------------------------------|-------------|-----------|----------|
| CR-01 | Inscription                  | ✅ Validé   |           |          |
| CR-02 | Connexion                    | ✅ Validé   |           |          |
| CR-03 | Tracker d'émotions           | ✅ Validé   |           |          |
| CR-04 | Calendrier émotionnel        | ✅ Validé   |           |          |
| CR-05 | Page Articles                | ✅ Validé   |           |          |
| CR-06 | Installation PWA             | ✅ Validé   |           |          |
| CR-07 | Administration articles      | ✅ Validé   |           |          |

**Légende :** ✅ Validé — ❌ Rejeté — ⚠️ Validé avec réserve — ⬜ À tester

---

**Niveaux de sévérité :**
- **Bloquant** — empêche la recette d'avancer, doit être corrigé avant validation
- **Majeur** — fonctionnalité dégradée, correction obligatoire avant mise en prod
- **Mineur** — gêne sans impact fonctionnel, correction possible post-mise en prod
- **Cosmétique** — problème visuel sans impact fonctionnel

---

## 3. Couverture des tests

| Type de test        | Statut       | Commentaire                                  |
|---------------------|--------------|----------------------------------------------|
| Tests unitaires     | ✅ Complets  | 33 tests, 6 composants couverts              |
| Tests d'intégration | ⬜ Non réalisés | Prévus dans une prochaine itération        |
| Tests de recette manuels | ✅ Complets  | 7/7 scénarios validés                  |

---

## 4. Décision de recette

> À compléter à l'issue des tests manuels

| Décision           | Commentaire                          |
|--------------------|--------------------------------------|
| ⬜ Accepté         |                                      |
| ✅ Accepté         |                                      |
| ⬜ Refusé — corrections requises |                        |

**Motif de la décision :**  
7 scénarios sur 7 validés. 36 tests unitaires passent à 100%. Une anomalie mineure relevée sur CR-06 : le nom affiché lors de l'installation PWA est "Ressources Relationnelles" au lieu de "Cesizen" (ancien cache manifest). Sans impact fonctionnel — correction possible post-mise en prod.

---

## 5. Signatures

| Rôle                              | Nom     | Date       | Signature |
|-----------------------------------|---------|------------|-----------|
| Développeur / Testeur / Chef de projet / Client | Natacha | 04/05/2026 |  |

---

*Document généré dans le cadre du projet Cesizen — branche `feature/test`*
