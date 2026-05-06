GUIDE DE RÉVISION COMPLET — CESIZEN
1. BASE DE DONNÉES (prisma/schema.prisma)
Les 4 modèles
User — représente un utilisateur inscrit


id         → identifiant unique généré automatiquement (format CUID)
email      → unique → on ne peut pas s'inscrire deux fois avec le même mail
firstName  → prénom
lastName   → nom
password   → mot de passe HASHÉ (jamais en clair)
role       → USER par défaut, ou ADMIN
resources  → relation : un user peut avoir plusieurs articles
emotions   → relation : un user peut avoir plusieurs entrées d'émotions
createdAt  → date de création (auto)
updatedAt  → date de dernière modification (auto)
Resource — un article/ressource


id          → identifiant unique
title       → titre de l'article
content     → contenu texte
imageUrl    → URL image optionnelle (le ? = nullable)
readingTime → durée de lecture en minutes (Int)
userId      → clé étrangère → l'admin qui a créé l'article
onDelete: Cascade → si le user est supprimé, ses articles aussi
SubEmotion — une sous-émotion (gérée par les admins)


id    → identifiant unique
label → le texte affiché (ex: "Anxieux", "Euphorique")
kind  → à quelle émotion principale elle appartient (ex: "fear", "joy")
EmotionEntry — une émotion enregistrée par un user un jour donné


date       → la date du ressenti
kind       → l'émotion principale (ex: "joy")
subEmotion → le label de la sous-émotion choisie (stocké en string)
userId     → l'utilisateur qui a enregistré
onDelete: Cascade → si le user est supprimé, ses émotions aussi
Question piège possible : Pourquoi subEmotion est une String et pas une relation vers SubEmotion ?

Parce qu'on stocke le label au moment de l'enregistrement. Si l'admin supprime une sous-émotion plus tard, l'historique de l'utilisateur n'est pas détruit.

2. AUTHENTIFICATION
Fichiers impliqués :
RegisterForm.tsx — formulaire en 4 étapes
LoginForm.tsx — formulaire de connexion
AuthShell.tsx — wrapper visuel des pages auth
route.ts (register) — API création de compte
route.ts (nextauth) — config NextAuth
middleware.ts — protection des routes
RegisterForm — inscription en 4 étapes

const steps = [
  { key: "lastName", ... },   // étape 0 : nom
  { key: "firstName", ... },  // étape 1 : prénom
  { key: "email", ... },      // étape 2 : email
  { key: "password", ... },   // étape 3 : mot de passe
]
step (state) = numéro de l'étape courante (0 à 3)

La logique du bouton :


const isLast = step === steps.length - 1  // étape 3 = dernière
const canNext = isLast
  ? !!form.password && form.password === form.confirmPassword  // les 2 mdp doivent correspondre
  : !!value  // sinon, juste vérifier que le champ est rempli
Quand on clique "Suivant" :


const handleNext = async () => {
  if (!isLast) return setStep(step + 1)  // on passe à l'étape suivante

  // sinon c'est la dernière étape : on envoie à l'API
  const res = await fetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ firstName, lastName, email, password })
  })
  if (res.ok) router.push("/login")  // succès → redirection login
  else setError(data.error)          // erreur → affichage message
}
API Register POST /api/auth/register :


// 1. Vérifie si l'email existe déjà
const existing = await prisma.user.findUnique({ where: { email } })
if (existing) return 400 "Email déjà utilisé"

// 2. Hash le mot de passe avec bcrypt (10 = nombre de "tours" → plus c'est haut, plus c'est sécurisé mais lent)
const hashedPassword = await bcrypt.hash(password, 10)

// 3. Crée l'utilisateur en base
await prisma.user.create({ data: { firstName, lastName, email, password: hashedPassword } })
// Le rôle est USER par défaut (défini dans le schéma Prisma)

return 201  // Created
LoginForm — connexion

const result = await signIn("credentials", { email, password, redirect: false })
// redirect: false → on gère la redirection nous-mêmes (pour afficher l'erreur si besoin)

if (result?.error) setError("Email ou mot de passe incorrect.")
else router.push("/")  // succès → accueil
Config NextAuth — comment ça vérifie le mot de passe :


async authorize(credentials) {
  // 1. Cherche le user par email
  const user = await prisma.user.findUnique({ where: { email: credentials.email } })
  if (!user) return null  // pas trouvé

  // 2. Compare le mot de passe avec le hash en base
  const passwordMatch = await bcrypt.compare(credentials.password, user.password)
  if (!passwordMatch) return null  // mauvais mot de passe

  // 3. Retourne le user → NextAuth crée le token JWT
  return { id: user.id, email, name, role: user.role }
}
Les callbacks JWT : servent à ajouter id et role dans le token et la session


async jwt({ token, user }) {
  if (user) { token.id = user.id; token.role = user.role }
  return token
}
async session({ session, token }) {
  session.user.id = token.id    // disponible dans tous les composants via useSession()
  session.user.role = token.role
  return session
}
Pourquoi ça ? Par défaut NextAuth ne met pas id ni role dans la session — on les ajoute manuellement via les callbacks.

Middleware — protection des routes

export default withAuth({ pages: { signIn: "/login" } })

// matcher = toutes les routes SAUF :
// login, register, api/auth, api/sub-emotions (public),
// fichiers statiques, service-worker, manifest PWA
Si on n'est pas connecté et qu'on va sur /, on est redirigé vers /login automatiquement.

Exception importante : /api/sub-emotions est public (pas dans le matcher) car le tracker d'émotions en a besoin — mais l'enregistrement d'une émotion lui est protégé.

3. TRACKER D'ÉMOTIONS
Fichiers impliqués :
EmotionTrackerPage.tsx
emotions.ts — les constantes
route.ts (emotions) — API GET/POST
Les constantes des émotions

export type EmotionKind = "surprise" | "anger" | "sadness" | "fear" | "joy" | "disgust"

EMOTION_COLORS  → couleur hex par émotion  (ex: joy → "#f0b429")
EMOTION_EMOJIS  → emoji par émotion        (ex: joy → "😊")
EMOTION_LABELS  → label FR par émotion     (ex: joy → "Joie")
Ces 3 objets sont utilisés partout dans le tracker ET le calendrier.

EmotionTrackerPage — 2 étapes
Props : date?: string → permet de tracker une émotion pour une date passée (depuis le calendrier)

States :


selectedEmotion   → l'émotion principale sélectionnée (défaut: "surprise")
selectedSubEmotion → la sous-émotion choisie (null au départ)
step              → "emotion" ou "subEmotion" (quelle étape on affiche)
subEmotions       → liste des sous-émotions chargées depuis l'API
error             → message d'erreur éventuel
Étape 1 (step === "emotion") :

Affiche un grand emoji de l'émotion sélectionnée
Grille de 6 boutons (un par émotion) → clic change selectedEmotion
Le bouton sélectionné a une bordure colorée + fond teinté
"Validation" → passe à l'étape suivante, reset selectedSubEmotion
Chargement des sous-émotions :


React.useEffect(() => {
  fetch(`/api/sub-emotions?kind=${selectedEmotion}`)
    .then(res => res.json())
    .then(data => setSubEmotions(data.subEmotions.map(s => s.label)))
}, [selectedEmotion])  // se relance à chaque changement d'émotion
Étape 2 (step === "subEmotion") :

Liste des sous-émotions pour l'émotion choisie
Clic sur une sous-émotion → la sélectionne (style actif)
"Validation" désactivé tant qu'aucune sous-émotion n'est choisie
Envoi final :


const res = await fetch("/api/emotions", {
  method: "POST",
  body: JSON.stringify({
    date: parsedDate.toISOString(),  // date ISO string
    kind: selectedEmotion,
    subEmotion: selectedSubEmotion
  })
})
if (res.ok) window.location.href = "/"  // redirection accueil (hard reload)
API Émotions
GET /api/emotions — récupère TOUTES les émotions de l'utilisateur connecté


const session = await getServerSession(authOptions)  // vérifie la session
if (!session?.user) return 401  // non connecté → refus

const userId = session.user.id  // id depuis le JWT
const emotions = await prisma.emotionEntry.findMany({
  where: { userId },            // seulement les émotions de CE user
  orderBy: { date: "desc" }     // du plus récent au plus ancien
})
POST /api/emotions — enregistre une émotion


// Vérification session obligatoire
if (!date || !kind || !subEmotion) return 400  // validation des champs

await prisma.emotionEntry.create({
  data: { date: new Date(date), kind, subEmotion, userId }
})
return 201  // Created
4. CALENDRIER D'ÉMOTIONS
Fichier : EmotionCalendar.tsx
States :


isLoading      → affiche le skeleton pendant le fetch
selectedDate   → la date affichée dans le calendrier (dayjs())
selectedPeriod → "week" | "month" | "year"  (filtre des stats)
entries        → toutes les émotions du user [{date, kind}]
Chargement au montage :


useEffect(() => {
  fetch("/api/emotions")
    .then(res => res.json())
    .then(data => {
      setEntries(data.emotions.map(e => ({
        date: dayjs(e.date).format("YYYY-MM-DD"),  // normalise la date
        kind: e.kind
      })))
      setIsLoading(false)
    })
}, [])  // [] = une seule fois au chargement
Composant EmotionDay — chaque case du calendrier :


// Cherche si ce jour a une émotion enregistrée
const entry = !outsideCurrentMonth
  ? emotionEntries.find(e => dayjs(e.date).isSame(day, "day"))
  : undefined

// Si oui → fond coloré + badge emoji en haut à droite
// Si non → case normale
Calcul de l'émotion dominante :


// 1. Filtre les entrées selon la période sélectionnée
const periodEntries = entries.filter(e => {
  const d = dayjs(e.date)
  return !d.isBefore(periodStart, "day") && !d.isAfter(periodEnd, "day")
})

// 2. Groupe par émotion + compte
const grouped = allKinds
  .map(kind => ({ kind, count: periodEntries.filter(e => e.kind === kind).length }))
  .filter(e => e.count > 0)        // ignore les émotions à 0
  .sort((a, b) => b.count - a.count)  // tri décroissant

// 3. La dominante = le premier
const dominant = grouped[0]
Barres de progression :


value={(e.count / max) * 100}  // max = count de l'émotion dominante
// → la dominante est toujours à 100%, les autres sont proportionnelles
5. ARTICLES (PAGE PUBLIQUE)
Fichiers : ArticlesPage.tsx + route.ts (ressources)
Logique simple :


useEffect(() => {
  fetch("/api/ressources")  // GET public, pas besoin d'être connecté
    .then(res => res.json())
    .then(data => setResources(data.resources ?? []))
}, [])
Rendu :

Si aucun article → message "Aucun article pour l'instant."
Sinon → une Paper par article avec image (optionnelle), badge temps de lecture, titre, contenu
API GET /api/ressources — public (pas de vérification session) :


const resources = await prisma.resource.findMany({
  orderBy: { createdAt: "desc" }  // les plus récents en premier
})
6. PANEL ADMIN
6a. Gestion des articles — ResourceAdminPage.tsx
Pattern create/update unifié :


// editingId = null → on crée
// editingId = "abc123" → on modifie
const url = editingId ? `/api/ressources/${editingId}` : "/api/ressources"
const method = editingId ? "PUT" : "POST"
handleEdit : remplit le formulaire avec les données de l'article et met editingId
handleDelete : appelle DELETE /api/ressources/:id puis recharge la liste
handleCancel : remet le formulaire vide et editingId = null

canSubmit : le bouton est désactivé si titre, contenu ou readingTime sont vides.

API protégée :


// POST - créer
if (session.user.role !== "ADMIN") return 403

// PUT /api/ressources/[id] - modifier
// DELETE /api/ressources/[id] - supprimer
// → vérifie ADMIN dans les deux cas
6b. Gestion des sous-émotions — EmotionAdminPage.tsx
States :


selectedKind → l'émotion principale en cours (défaut: "joy")
subEmotions  → TOUTES les sous-émotions de toutes les émotions
newLabel     → champ texte pour en ajouter une
Filtrage côté client :


const filtered = subEmotions.filter(s => s.kind === selectedKind)
// On charge tout d'un coup, on filtre en JS selon l'onglet sélectionné
Ajouter une sous-émotion :


await fetch("/api/admin/sub-emotions", {
  method: "POST",
  body: JSON.stringify({ label: newLabel.trim(), kind: selectedKind })
})
// Entrée clavier aussi supportée : onKeyDown e.key === "Enter"
API admin/sub-emotions :


// Fonction helper requireAdmin() → évite la duplication
const requireAdmin = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) return "Non autorisé"       // → 401
  if (role !== "ADMIN") return "Accès refusé"     // → 403
  return null  // ok
}
7. INFRASTRUCTURE
Prisma Client — prisma.ts

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)  // utilise pg (Pool) comme driver

// Pattern singleton : évite de créer plusieurs connexions en dev (Next.js hot-reload)
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma  // mémorise l'instance globalement
}
Pourquoi ? En dev, Next.js recharge les modules mais pas globalThis → sans ça, on créerait des dizaines de connexions BDD.

Layout global — layout.tsx

// Providers = SessionProvider de NextAuth → rend useSession() accessible partout
<Providers>
  {children}
  <PwaInstallButton />       // bouton "Installer l'app"
  <PushNotificationManager /> // gestion notifications push
  © 2025 Cesizen
</Providers>

// Service Worker enregistré après le chargement de la page
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
}
8. LES TESTS (ligne par ligne)
Configuration des tests
vitest.config.ts :


environment: "jsdom"          // simule un navigateur (DOM) dans Node.js
setupFiles: ["./src/test/setup.ts"]  // chargé avant chaque fichier de test
setup.ts :


import "@testing-library/jest-dom"  // ajoute les matchers : toBeInTheDocument(), toBeDisabled(), etc.
Tests LoginForm (4 tests)
Mocks nécessaires :


vi.mock("next/link", ...)          // évite les erreurs Next.js en test
vi.mock("next/navigation", ...)    // useRouter → pas de vrai routeur
vi.mock("next-auth/react", ...)    // signIn → pas de vrai appel auth
Test	Ce qu'il vérifie	Méthode
"affiche les champs"	Les placeholders existent	getByPlaceholderText
"lien inscription"	Le lien /register est présent	getByRole("link") + toHaveAttribute
"bouton désactivé vide"	Bouton disabled si champs vides	getByRole("button") + toBeDisabled()
"bouton actif rempli"	Bouton enabled après saisie	userEvent.type + toBeEnabled()
Tests RegisterForm (9 tests + helper)
vi.stubGlobal("fetch", mockFetch) → remplace le vrai fetch global par un mock contrôlable.

Helper goToStep(user, n) : automatise les clics pour atteindre l'étape n sans répéter dans chaque test.

Test	Ce qu'il vérifie
"première étape"	Le champ Nom s'affiche
"lien connexion"	Lien /login présent
"bouton désactivé vide"	Suivant disabled si champ vide
"passe à l'étape prénom"	Après saisie + clic, étape 1 → étape 2
"erreur mots de passe"	Message d'erreur si mdp différents + bouton disabled
"envoi API"	mockFetch appelé avec /api/auth/register
Pour le test d'envoi API :


mockFetch.mockResolvedValueOnce({ ok: true })  // simule une réponse 200 OK
// → on vérifie que fetch a bien été appelé avec la bonne URL
expect(mockFetch).toHaveBeenCalledWith("/api/auth/register", expect.any(Object))
Tests AuthShell (4 tests)
Composant "bête" (pas de logique) → tests simples de rendu de props.


// Vérifie que title et description passés en props s'affichent bien
// Vérifie que children s'affiche
// Vérifie qu'un texte NON fourni n'apparaît pas (queryByText → null)
Tests EmotionCalendar (7 tests)
Mock FluentEmoji : les emojis font des appels réseau → on les simule avec un simple <span>.

beforeEach : avant chaque test, le mock de fetch retourne { emotions: [] } → propre.

Test	Ce qu'il vérifie
"titre calendrier"	"Ton calendrier du mois" présent
"label suivi"	"Suivi emotionnel" présent
"bouton jour"	"Mon emotion du jour" présent
"3 filtres"	Boutons Semaine / Mois / Annee présents
"sans données → message"	findByText(/aucune emotion/i) (async, attend le fetch)
"avec données → dominante"	Simule une émotion joy → vérifie "emotion dominante" apparaît
Différence getByText vs findByText :

getBy = synchrone, échoue si pas là immédiatement
findBy = asynchrone, attend que l'élément apparaisse (utile après un fetch)
Tests ArticlesPage (3 tests)

// Mock PublicHeader → null (évite les problèmes de rendu du header)
vi.mock("@/shared/ui/layout/PublicHeader", () => ({ PublicHeader: () => null }))

// beforeEach : fetch retourne { resources: [] }
// Test "aucun article" → findByText (async car fetch)
9. QUESTIONS DU JURY — RÉPONSES PRÊTES
"Pourquoi Next.js ?"

Fullstack en une seule app : les API routes sont dans le même projet que le front. Pas besoin d'un back séparé. L'App Router permet aussi le rendering serveur.

"Comment vous sécurisez les routes admin ?"

Double protection : le middleware bloque l'accès aux pages si non connecté, et chaque API admin vérifie session.user.role === "ADMIN" côté serveur. Même si quelqu'un contourne le front, l'API refuse.

"Pourquoi bcrypt avec 10 tours ?"

Bcrypt est un algorithme de hashage lent par design. 10 tours = environ 100ms par hash, ce qui est négligeable pour l'utilisateur mais rend une attaque brute-force très coûteuse.

"Pourquoi JWT et pas session en base ?"

JWT = stateless. Pas besoin de table de sessions en base. NextAuth gère le token dans un cookie httpOnly sécurisé.

"Que se passe-t-il si on supprime une sous-émotion qu'un user a utilisée ?"

Rien. EmotionEntry.subEmotion stocke le label (string), pas une clé étrangère. L'historique de l'utilisateur est préservé.

"Pourquoi un singleton Prisma ?"

En dev, Next.js hot-reload recrée les modules mais pas globalThis. Sans singleton, chaque reload créerait une nouvelle pool de connexions et on épuiserait la base.

"C'est quoi une PWA ?"

Progressive Web App : une app web qui peut être installée sur le téléphone comme une app native. Elle a un manifest.json (icône, nom, couleurs) et un service worker qui permet le mode offline.

"Comment les tests évitent les vrais appels réseau ?"

vi.stubGlobal("fetch", mockFetch) remplace le fetch global par une fonction Vitest contrôlée. On lui dit ce qu'elle doit retourner (mockResolvedValue). Même chose pour NextAuth avec vi.mock.

10. FLUX COMPLETS À CONNAÎTRE PAR CŒUR
Inscription :

RegisterForm (4 étapes) → POST /api/auth/register → bcrypt.hash → prisma.user.create → redirect /login

Connexion :

LoginForm → signIn("credentials") → NextAuth authorize → bcrypt.compare → JWT créé avec id+role → redirect /

Tracker émotion :

/emotions/tracker → fetch sous-émotions → step 1 (choix émotion) → step 2 (choix sous-émotion) → POST /api/emotions → redirect /

Calendrier :

GET /api/emotions (toutes les émotions du user) → affichage par mois → filtre période → calcul dominante

Admin article :

GET /api/ressources (public) → formulaire → POST ou PUT /api/ressources/[id] (vérif ADMIN) → refresh liste

