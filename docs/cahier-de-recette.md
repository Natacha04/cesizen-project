# Cahier de recette — Cesizen

> Tests fonctionnels manuels réalisés par le recetteur  
> Environnement : application déployée ou `npm run dev` sur http://localhost:3000

---

## Prérequis généraux

- L'application est démarrée et accessible
- La base de données PostgreSQL est active
- Un compte utilisateur de test est disponible : `recette@cesizen.fr` / `Recette2025!`
- Un compte administrateur est disponible : `admin@cesizen.fr` / `Admin2025!`

---

## Scénario CR-01 — Inscription d'un nouvel utilisateur

**Acteur :** Visiteur non connecté  
**Objectif :** Vérifier que le formulaire d'inscription crée un compte valide

| Étape | Action                                               | Résultat attendu                                     |
|-------|------------------------------------------------------|------------------------------------------------------|
| 1     | Ouvrir `/register`                                   | Le formulaire d'inscription s'affiche                |
| 2     | Laisser tous les champs vides et observer le bouton  | Le bouton "Créer un compte" est grisé / désactivé    |
| 3     | Saisir un prénom, un nom, un email valide            | Aucun message d'erreur                               |
| 4     | Saisir un mot de passe et une confirmation différente| Message "Les mots de passe doivent correspondre"     |
| 5     | Corriger la confirmation pour qu'elle corresponde    | Le message d'erreur disparaît                        |
| 6     | Cliquer "Créer un compte"                            | Redirection vers la page de connexion ou d'accueil   |
| 7     | Tenter de créer un compte avec le même email         | Message d'erreur "Email déjà utilisé."               |

**Critère d'acceptation :** Le compte est créé en base, l'utilisateur peut se connecter.

---

## Scénario CR-02 — Connexion d'un utilisateur existant

**Acteur :** Utilisateur inscrit  
**Objectif :** Vérifier le flux de connexion

| Étape | Action                                               | Résultat attendu                                     |
|-------|------------------------------------------------------|------------------------------------------------------|
| 1     | Ouvrir `/login`                                      | Le formulaire de connexion s'affiche                 |
| 2     | Laisser les champs vides et observer le bouton       | Le bouton "Se connecter" est désactivé               |
| 3     | Saisir email + mot de passe incorrects               | Message d'erreur d'authentification                  |
| 4     | Saisir `recette@cesizen.fr` + `Recette2025!`         | Redirection vers la page d'accueil                   |
| 5     | Vérifier que le menu affiche le profil utilisateur   | Nom de l'utilisateur visible dans l'interface        |

**Critère d'acceptation :** L'utilisateur accède à son espace après connexion.

---

## Scénario CR-03 — Tracker d'émotions

**Acteur :** Utilisateur connecté  
**Objectif :** Enregistrer une émotion du jour

| Étape | Action                                               | Résultat attendu                                     |
|-------|------------------------------------------------------|------------------------------------------------------|
| 1     | Naviguer vers `/emotions/tracker`                    | La question "Comment tu te sens aujourd'hui ?" s'affiche |
| 2     | Observer la date affichée                            | La date du jour est affichée au format JJ/MM/AAAA    |
| 3     | Cliquer sur une émotion parmi les 6 proposées        | L'émotion est sélectionnée (bordure visible)         |
| 4     | Cliquer "Validation" sans sélectionner d'émotion (défaut) | Passage à l'étape des sous-émotions            |
| 5     | Observer l'étape 2 sans sélectionner de sous-émotion | Le bouton "Validation" est désactivé                |
| 6     | Sélectionner une sous-émotion                        | Le bouton "Validation" s'active                     |
| 7     | Cliquer "Validation"                                 | L'entrée est enregistrée (confirmation ou redirection)|

**Critère d'acceptation :** L'entrée d'émotion est visible dans le calendrier.

---

## Scénario CR-04 — Calendrier émotionnel

**Acteur :** Utilisateur connecté  
**Objectif :** Consulter l'historique des émotions

| Étape | Action                                               | Résultat attendu                                     |
|-------|------------------------------------------------------|------------------------------------------------------|
| 1     | Naviguer vers la page calendrier                     | Le calendrier du mois en cours s'affiche             |
| 2     | Observer les jours avec des émotions                 | Des emojis s'affichent sur les jours renseignés      |
| 3     | Cliquer sur un autre mois (flèche navigation)        | Le calendrier se met à jour pour ce mois             |
| 4     | Sélectionner le filtre "Semaine"                     | La section "Emotion dominante" se met à jour         |
| 5     | Sélectionner le filtre "Annee"                       | La section "Emotion dominante" affiche l'année       |
| 6     | Cliquer "Mon emotion du jour"                        | Redirection vers `/emotions/tracker?date=...`        |

**Critère d'acceptation :** Les données affichées correspondent aux entrées enregistrées.

---

## Scénario CR-05 — Page Articles

**Acteur :** Tout utilisateur (connecté ou non)  
**Objectif :** Vérifier l'affichage de la page articles

| Étape | Action                                               | Résultat attendu                                      |
|-------|------------------------------------------------------|-------------------------------------------------------|
| 1     | Naviguer vers `/articles`                            | La page s'affiche sans erreur                         |
| 2     | Observer le contenu                                  | Label "Articles", titre et description visibles       |
| 3     | Vérifier l'accessibilité sans connexion              | La page est accessible aux visiteurs non connectés    |

**Critère d'acceptation :** La page s'affiche correctement dans tous les cas.

---

## Scénario CR-06 — Installation PWA

**Acteur :** Visiteur sur mobile ou navigateur compatible  
**Objectif :** Vérifier l'installabilité de l'application

| Étape | Action                                               | Résultat attendu                                      |
|-------|------------------------------------------------------|-------------------------------------------------------|
| 1     | Ouvrir l'application sur Chrome mobile               | La bannière d'installation s'affiche ou le bouton "Installer l'app" est visible |
| 2     | Cliquer sur le bouton d'installation                 | Fenêtre de confirmation du navigateur                 |
| 3     | Confirmer l'installation                             | L'app apparaît sur l'écran d'accueil                  |
| 4     | Ouvrir l'app depuis l'écran d'accueil                | L'app se lance en mode standalone (sans barre URL)    |
| 5     | Couper la connexion internet et recharger            | L'app affiche un écran hors-ligne (service worker)    |

**Critère d'acceptation :** L'application est installable et fonctionne en mode standalone.

---

## Scénario CR-07 — Administration des articles

**Acteur :** Administrateur connecté  
**Objectif :** Gérer les articles depuis l'interface admin

| Étape | Action                                               | Résultat attendu                                      |
|-------|------------------------------------------------------|-------------------------------------------------------|
| 1     | Se connecter avec `admin@cesizen.fr`                 | Accès à l'interface admin                             |
| 2     | Créer un nouvel article avec titre et contenu        | Article créé et visible dans la liste                 |
| 3     | Modifier un article existant                         | Les modifications sont sauvegardées                   |
| 4     | Supprimer un article                                 | L'article disparaît de la liste et de la page publique|
| 5     | Tenter d'accéder à l'admin avec un compte standard  | Accès refusé (redirection ou message d'erreur)        |

**Critère d'acceptation :** Les opérations CRUD fonctionnent, les droits sont respectés.

---

## Grille de résultats (à compléter par le recetteur)

| Scénario | Titre                        | Statut     | Anomalies | Commentaire |
|----------|------------------------------|------------|-----------|-------------|
| CR-01    | Inscription                  | ✅ Validé   |           |             |
| CR-02    | Connexion                    | ✅ Validé   |           |             |
| CR-03    | Tracker d'émotions           | ✅ Validé   |           |             |
| CR-04    | Calendrier émotionnel        | ✅ Validé   |           |             |
| CR-05    | Page Articles                | ✅ Validé   |           |             |
| CR-06    | Installation PWA             | ✅ Validé   | Nom affiché "Ressources Relationnelles" au lieu de "Cesizen" (cache ancien manifest) | Mineur |
| CR-07    | Administration articles      | ✅ Validé   |           |             |
