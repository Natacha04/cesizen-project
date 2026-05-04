# Cahier de test — Cesizen

> Tests unitaires automatisés — Vitest + Testing Library  
> Exécution : `npx vitest run`

---

## Module : Authentification — LoginForm

Fichier de test : `src/features/auth/views/LoginForm.test.tsx`

| ID    | Description                                          | Type | Résultat attendu                                                    | Statut |
|-------|------------------------------------------------------|------|---------------------------------------------------------------------|--------|
| LF-01 | Affiche les champs email et mot de passe             | ✅   | Champs avec placeholders "Votre adresse mail" et "Votre mot de passe" présents | ✅ PASS |
| LF-02 | Affiche un lien vers la page d'inscription           | ✅   | Lien `href="/register"` avec texte "Créer votre compte !"           | ✅ PASS |
| LF-03 | Le bouton est désactivé si les champs sont vides     | ❌   | Bouton "Suivant" est `disabled`                                     | ✅ PASS |
| LF-04 | Le bouton s'active quand email et mot de passe sont remplis | ✅ | Bouton "Suivant" est activé                                   | ✅ PASS |

---

## Module : Authentification — RegisterForm

Fichier de test : `src/features/auth/views/RegisterForm.test.tsx`

| ID    | Description                                             | Type | Résultat attendu                                                    | Statut |
|-------|---------------------------------------------------------|------|---------------------------------------------------------------------|--------|
| RF-01 | Affiche la première étape avec le champ Nom             | ✅   | Titre "Votre nom" et champ placeholder "Nom" visibles               | ✅ PASS |
| RF-02 | Affiche un lien vers la page de connexion               | ✅   | Lien `href="/login"` avec texte "Se connecter"                      | ✅ PASS |
| RF-03 | Le bouton Suivant est désactivé si le champ est vide    | ❌   | Bouton "Suivant" est `disabled`                                     | ✅ PASS |
| RF-04 | Le bouton Suivant s'active quand le champ est rempli    | ✅   | Bouton "Suivant" est activé après saisie                            | ✅ PASS |
| RF-05 | Cliquer Suivant passe à l'étape suivante                | ✅   | Titre "Votre prénom" visible après clic                             | ✅ PASS |
| RF-06 | Affiche "Créer mon compte" à la dernière étape          | ✅   | Bouton "Créer mon compte" présent à l'étape 4                       | ✅ PASS |
| RF-07 | Affiche une erreur si les mots de passe ne correspondent pas | ❌ | Message "Les mots de passe doivent correspondre" + bouton désactivé | ✅ PASS |
| RF-08 | Envoie les données à l'API lors de la soumission        | ✅   | `fetch("/api/auth/register", ...)` est appelé                       | ✅ PASS |
| RF-09 | Affiche un message d'erreur si l'inscription échoue     | ❌   | Message "Email déjà utilisé." apparaît dans le DOM                  | ✅ PASS |

---

## Module : Authentification — AuthShell

Fichier de test : `src/features/auth/views/AuthShell.test.tsx`

| ID    | Description                                          | Type | Résultat attendu                                            | Statut |
|-------|------------------------------------------------------|------|-------------------------------------------------------------|--------|
| AS-01 | Affiche le titre passé en prop                       | ✅   | Le texte du `title` est visible                             | ✅ PASS |
| AS-02 | Affiche la description passée en prop                | ✅   | Le texte de `description` est visible                       | ✅ PASS |
| AS-03 | Affiche le contenu enfant (children)                 | ✅   | Le contenu passé en `children` est rendu                    | ✅ PASS |
| AS-04 | N'affiche pas un titre qui n'a pas été fourni        | ❌   | Un texte non passé en prop est absent du DOM                | ✅ PASS |

---

## Module : Émotions — EmotionTrackerPage

Fichier de test : `src/features/emotions/views/EmotionTrackerPage.test.tsx`

| ID    | Description                                          | Type | Résultat attendu                                            | Statut |
|-------|------------------------------------------------------|------|-------------------------------------------------------------|--------|
| ET-01 | Affiche la question initiale                         | ✅   | Texte "Comment tu te sens aujourd'hui ?" visible            | ✅ PASS |
| ET-02 | Affiche au moins 6 boutons d'émotion                 | ✅   | ≥ 6 boutons présents à l'étape 1                            | ✅ PASS |
| ET-03 | Passe à l'étape sous-émotion après validation        | ✅   | Cliquer "Validation" → texte "Etonnement" visible           | ✅ PASS |
| ET-04 | Le bouton Validation est désactivé sans sous-émotion | ❌   | À l'étape 2, bouton "Validation" est `disabled`             | ✅ PASS |
| ET-05 | Le bouton Validation s'active après sélection        | ✅   | Sélectionner une sous-émotion active le bouton              | ✅ PASS |
| ET-06 | Affiche une date valide passée en prop               | ✅   | `date="2025-12-25"` → affiche "25/12/2025"                  | ✅ PASS |
| ET-07 | Affiche la date du jour si la date est invalide      | ❌   | `date="pas-une-date"` → affiche la date du jour en FR       | ✅ PASS |
| ET-08 | Les sous-émotions ne sont pas visibles à l'étape 1   | ❌   | "Etonnement" absent du DOM à l'étape 1                      | ✅ PASS |

---

## Module : Émotions — EmotionCalendar

Fichier de test : `src/features/emotions/views/EmotionCalendar.test.tsx`

| ID    | Description                                          | Type | Résultat attendu                                            | Statut |
|-------|------------------------------------------------------|------|-------------------------------------------------------------|--------|
| EC-01 | Affiche le titre du calendrier                       | ✅   | Texte "Ton calendrier du mois" visible                      | ✅ PASS |
| EC-02 | Affiche le label "Suivi emotionnel"                  | ✅   | Texte "Suivi emotionnel" visible                            | ✅ PASS |
| EC-03 | Affiche le bouton "Mon emotion du jour"              | ✅   | Bouton présent et cliquable                                 | ✅ PASS |
| EC-04 | Affiche les 3 filtres de période                     | ✅   | Boutons "Semaine", "Mois", "Annee" présents                 | ✅ PASS |
| EC-05 | Sans données, affiche "aucune emotion disponible"    | ❌   | Message d'absence affiché quand l'API retourne []           | ✅ PASS |
| EC-06 | Affiche l'émotion dominante avec des données         | ✅   | "Emotion dominante" visible après chargement avec données   | ✅ PASS |
| EC-07 | Le filtre Semaine s'active au clic                   | ✅   | Bouton "Semaine" a `aria-pressed="true"` après clic         | ✅ PASS |

---

## Module : Contenu — ArticlesPage

Fichier de test : `src/features/articles/views/ArticlesPage.test.tsx`

| ID    | Description                                          | Type | Résultat attendu                                            | Statut |
|-------|------------------------------------------------------|------|-------------------------------------------------------------|--------|
| AP-01 | Affiche le label "Articles"                          | ✅   | Texte "Articles" visible                                    | ✅ PASS |
| AP-02 | Affiche le titre principal                           | ✅   | Texte "Ressources et contenus" visible                      | ✅ PASS |
| AP-03 | Affiche un message quand il n'y a aucun article      | ✅   | "Aucun article pour l'instant." visible quand API vide      | ✅ PASS |
| AP-04 | Affiche les articles retournés par l'API             | ✅   | Le titre d'un article s'affiche après chargement            | ✅ PASS |

---

## Récapitulatif

| Module             | Tests | Passés | Échoués |
|--------------------|-------|--------|---------|
| LoginForm          | 4     | 4      | 0       |
| RegisterForm       | 9     | 9      | 0       |
| AuthShell          | 4     | 4      | 0       |
| EmotionTrackerPage | 8     | 8      | 0       |
| EmotionCalendar    | 7     | 7      | 0       |
| ArticlesPage       | 4     | 4      | 0       |
| **Total**          | **36**| **36** | **0**   |

**Taux de réussite : 100%**
