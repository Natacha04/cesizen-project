# Révision Soutenance — Cesizen

> Guide de révision complet pour comprendre chaque fonctionnalité, chaque ligne de code et chaque test.

---

## Sommaire

1. [C'est quoi Cesizen ?](#cest-quoi-cesizen)
2. [La base de données](#la-base-de-données)
3. [Authentification](#authentification)
4. [Tracker d'émotions](#tracker-démotions)
5. [Calendrier d'émotions](#calendrier-démotions)
6. [Articles publics](#articles-publics)
7. [Panel Admin](#panel-admin)
8. [Infrastructure](#infrastructure)
9. [Les tests expliqués](#les-tests-expliqués)
10. [Questions du jury — réponses prêtes](#questions-du-jury--réponses-prêtes)
11. [Flux complets à connaître par cœur](#flux-complets-à-connaître-par-cœur)

---

## C'est quoi Cesizen ?

Cesizen est une **application web de bien-être mental** développée pour le **Ministère de la Santé et de la Prévention**.

### Ce que l'app permet :

| Qui | Peut faire quoi |
|-----|----------------|
| Visiteur (non connecté) | Lire les articles de ressources |
| Utilisateur connecté | Enregistrer ses émotions du jour, voir son calendrier |
| Admin | Gérer les articles + gérer les sous-émotions |

### Stack technique en une ligne :

> **Next.js** (fullstack) + **TypeScript** + **PostgreSQL** + **Prisma** + **NextAuth** + **Material UI** + **Vitest**

---

## La base de données

> **Prisma** est l'ORM : il fait le lien entre le code TypeScript et la base PostgreSQL. On écrit des requêtes en TypeScript, Prisma les traduit en SQL.

Fichier : `prisma/schema.prisma`

---

### Modèle `User` — l'utilisateur

```prisma
model User {
  id        String         @id @default(cuid())   // identifiant unique auto-généré
  email     String         @unique                 // on ne peut pas s'inscrire 2 fois avec le même mail
  firstName String                                 // prénom
  lastName  String                                 // nom
  password  String                                 // mot de passe HASHÉ (jamais en clair !)
  role      Role           @default(USER)          // USER par défaut, peut être ADMIN
  resources Resource[]                             // relation : un user peut avoir plusieurs articles
  emotions  EmotionEntry[]                         // relation : un user peut avoir plusieurs émotions
  createdAt DateTime       @default(now())         // date de création automatique
  updatedAt DateTime       @updatedAt              // date de modification automatique
}
```

---

### Modèle `Resource` — un article

```prisma
model Resource {
  id          String   @id @default(cuid())
  title       String                              // titre de l'article
  content     String                              // contenu texte
  imageUrl    String?                             // le ? = optionnel (peut être null)
  readingTime Int                                 // durée de lecture en minutes
  userId      String                              // clé étrangère → l'admin auteur
  user        User     @relation(...)
              onDelete: Cascade                   // si l'admin est supprimé, ses articles aussi
  createdAt   DateTime @default(now())
}
```

---

### Modèle `SubEmotion` — une sous-émotion

```prisma
model SubEmotion {
  id        String   @id @default(cuid())
  label     String                              // le texte affiché ex: "Anxieux", "Euphorique"
  kind      String                              // à quelle émotion principale elle appartient ex: "fear"
  createdAt DateTime @default(now())
}
```

---

### Modèle `EmotionEntry` — une émotion enregistrée par un user

```prisma
model EmotionEntry {
  id         String   @id @default(cuid())
  date       DateTime                          // la date du ressenti
  kind       String                            // l'émotion principale ex: "joy"
  subEmotion String                            // le label de la sous-émotion (stocké comme texte !)
  userId     String                            // qui a enregistré
  user       User     @relation(...)
             onDelete: Cascade                 // si le user est supprimé, ses émotions aussi
  createdAt  DateTime @default(now())
}
```

> ⚠️ **Question piège possible :** *Pourquoi `subEmotion` est une String et pas une relation vers `SubEmotion` ?*
>
> Parce qu'on copie le label au moment de l'enregistrement. Si un admin supprime une sous-émotion plus tard, l'historique de l'utilisateur n'est **pas détruit**. C'est un choix délibéré.

---

### Enum `Role`

```prisma
enum Role {
  USER   // rôle par défaut à l'inscription
  ADMIN  // accès au panel d'administration
}
```

---

## Authentification

### Fichiers impliqués

| Fichier | Rôle |
|---------|------|
| `src/features/auth/views/RegisterForm.tsx` | Formulaire d'inscription (4 étapes) |
| `src/features/auth/views/LoginForm.tsx` | Formulaire de connexion |
| `src/features/auth/views/AuthShell.tsx` | Wrapper visuel des pages auth |
| `src/app/api/auth/register/route.ts` | API qui crée le compte en base |
| `src/app/api/auth/[...nextauth]/route.ts` | Config NextAuth (vérification mot de passe) |
| `src/middleware.ts` | Protège les routes si non connecté |

---

### RegisterForm — inscription en 4 étapes

L'inscription est découpée en **4 étapes** affichées une par une, au lieu d'un grand formulaire.

```ts
// Les 4 étapes définies en tableau
const steps = [
  { key: "lastName",  title: "Votre nom",          type: "text",     ... },
  { key: "firstName", title: "Votre prénom",        type: "text",     ... },
  { key: "email",     title: "Votre adresse mail",  type: "email",    ... },
  { key: "password",  title: "Votre mot de passe",  type: "password", ... },
]
```

```ts
// State : numéro de l'étape courante (0 à 3)
const [step, setStep] = useState(0)

// State : toutes les valeurs du formulaire dans un seul objet
const [form, setForm] = useState({
  lastName: "", firstName: "", email: "", password: "", confirmPassword: ""
})
```

**La logique du bouton "Suivant" :**

```ts
const isLast = step === steps.length - 1  // true si on est à l'étape 3 (mot de passe)

const canNext = isLast
  ? !!form.password && form.password === form.confirmPassword  // étape finale : les 2 mdp doivent correspondre
  : !!value                                                    // sinon : le champ courant doit être rempli
```

**Quand on clique "Suivant" :**

```ts
const handleNext = async () => {
  // Pas la dernière étape → on avance juste
  if (!isLast) return setStep(step + 1)

  // Dernière étape → on envoie les données à l'API
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, email, password }),
  })

  if (res.ok) {
    router.push("/login")       // succès → redirection vers la connexion
  } else {
    const data = await res.json()
    setError(data.error)        // erreur → on affiche le message
  }
}
```

**Le bouton Retour** n'apparaît que si `step > 0` → pas de retour depuis la première étape.

---

### API Register — `POST /api/auth/register`

```ts
export async function POST(req: Request) {
  const { firstName, lastName, email, password } = await req.json()

  // 1. Vérifie si l'email est déjà utilisé
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email déjà utilisé." }, { status: 400 })
  }

  // 2. Hash le mot de passe
  // bcrypt.hash(password, 10) → 10 = nombre de "tours" de l'algorithme
  // Plus c'est haut, plus c'est sécurisé mais lent. 10 = standard recommandé (~100ms)
  const hashedPassword = await bcrypt.hash(password, 10)

  // 3. Crée l'utilisateur en base (rôle USER par défaut, défini dans le schéma)
  await prisma.user.create({
    data: { firstName, lastName, email, password: hashedPassword },
  })

  return NextResponse.json({ success: true }, { status: 201 })
  //                                                     ^^^ 201 = "Created" (standard HTTP)
}
```

---

### LoginForm — connexion

```ts
const handleSubmit = async (event) => {
  event.preventDefault()  // empêche le rechargement de la page
  setError("")             // reset l'erreur précédente

  // signIn de NextAuth : envoie email + mdp au provider "credentials"
  // redirect: false → on gère nous-mêmes la redirection (pour afficher l'erreur si besoin)
  const result = await signIn("credentials", { email, password, redirect: false })

  if (result?.error) {
    setError("Email ou mot de passe incorrect.")  // NextAuth retourne une erreur
  } else {
    router.push("/")  // succès → page d'accueil
  }
}
```

**Le bouton est désactivé si** `!email || !password` → pas besoin de validation côté API pour ça.

---

### Config NextAuth — `[...nextauth]/route.ts`

C'est ici que NextAuth vérifie si le login est valide.

```ts
async authorize(credentials) {
  // Sécurité : si les champs sont vides, on refuse directement
  if (!credentials?.email || !credentials?.password) return null

  // 1. Cherche l'utilisateur par email en base
  const user = await prisma.user.findUnique({ where: { email: credentials.email } })
  if (!user) return null  // email inexistant → refus

  // 2. Compare le mot de passe tapé avec le hash stocké en base
  // bcrypt.compare(texte, hash) → true si ça correspond
  const passwordMatch = await bcrypt.compare(credentials.password, user.password)
  if (!passwordMatch) return null  // mauvais mot de passe → refus

  // 3. Succès → NextAuth va créer un JWT avec ces infos
  return { id: user.id, email: user.email, name: `${user.firstName} ${user.lastName}`, role: user.role }
}
```

**Les callbacks — pourquoi on en a besoin :**

> Par défaut, NextAuth ne met QUE `name`, `email`, `image` dans la session.
> On a besoin de `id` et `role` dans toute l'app → on les ajoute manuellement.

```ts
// Callback JWT : enrichit le token à la connexion
async jwt({ token, user }) {
  if (user) {
    token.id = user.id      // on stocke l'id dans le token
    token.role = user.role  // on stocke le rôle dans le token
  }
  return token
}

// Callback session : recopie les infos du token dans la session (accessible via useSession())
async session({ session, token }) {
  session.user.id = token.id
  session.user.role = token.role
  return session
}
```

---

### Middleware — protection des routes

```ts
// withAuth = middleware NextAuth qui bloque les pages si non connecté
export default withAuth({
  pages: { signIn: "/login" }  // si non connecté → redirection vers /login
})

// matcher = liste des routes À PROTÉGER
// Toutes les routes SAUF : login, register, api/auth, api/sub-emotions (public), fichiers statiques
export const config = {
  matcher: ["/((?!login|register|api/auth|api/sub-emotions|_next/static|...).*) "],
}
```

> Si quelqu'un essaie d'accéder à `/` sans être connecté → redirigé vers `/login` automatiquement.

---

## Tracker d'émotions

### Fichiers impliqués

| Fichier | Rôle |
|---------|------|
| `src/features/emotions/views/EmotionTrackerPage.tsx` | Composant principal (2 étapes) |
| `src/shared/constants/emotions.ts` | Constantes : couleurs, emojis, labels |
| `src/app/api/emotions/route.ts` | API GET (liste) + POST (enregistrement) |
| `src/app/api/sub-emotions/route.ts` | API GET public pour charger les sous-émotions |

---

### Les constantes des émotions

```ts
// Fichier : src/shared/constants/emotions.ts

// Le type : seulement ces 6 valeurs sont acceptées
export type EmotionKind = "surprise" | "anger" | "sadness" | "fear" | "joy" | "disgust"

// Couleur associée à chaque émotion (utilisée pour les styles dynamiques)
export const EMOTION_COLORS: Record<EmotionKind, string> = {
  surprise: "#d97745",  // orange
  anger:    "#d62828",  // rouge
  sadness:  "#9bb7ff",  // bleu clair
  fear:     "#6c7178",  // gris
  joy:      "#f0b429",  // jaune
  disgust:  "#7b9e45",  // vert
}

// Emoji associé à chaque émotion
export const EMOTION_EMOJIS: Record<EmotionKind, string> = {
  surprise: "😲", anger: "😡", sadness: "😔",
  fear: "😰", joy: "😊", disgust: "🤢",
}

// Label français affiché à l'utilisateur
export const EMOTION_LABELS: Record<EmotionKind, string> = {
  surprise: "Surpris", anger: "Colère", sadness: "Tristesse",
  fear: "Peur", joy: "Joie", disgust: "Dégoût",
}
```

---

### EmotionTrackerPage — 2 étapes

**Props :**
```ts
type EmotionTrackerPageProps = {
  date?: string  // optionnel : permet de tracker une émotion pour une date passée
}
```

**States :**
```ts
const [selectedEmotion, setSelectedEmotion]       = useState<EmotionKind>("surprise")
const [selectedSubEmotion, setSelectedSubEmotion] = useState<string | null>(null)
const [step, setStep]                             = useState<"emotion" | "subEmotion">("emotion")
const [error, setError]                           = useState("")
const [subEmotions, setSubEmotions]               = useState<string[]>([])
```

**Chargement des sous-émotions — se relance à chaque changement d'émotion :**

```ts
React.useEffect(() => {
  fetch(`/api/sub-emotions?kind=${selectedEmotion}`)   // ex: ?kind=joy
    .then(res => res.json())
    .then(data => setSubEmotions(
      (data.subEmotions ?? []).map((s: { label: string }) => s.label)
      // on extrait juste les labels (string[]) pour l'affichage
    ))
}, [selectedEmotion])  // dépendance : se relance quand l'émotion change
```

**Étape 1 — choix de l'émotion principale :**
- Affiche le grand emoji de `selectedEmotion`
- Grille de 6 boutons (un par émotion)
- Le bouton sélectionné a une bordure colorée + fond teinté avec `EMOTION_COLORS[kind]`
- Clic sur "Validation" → passe à l'étape 2 + reset `selectedSubEmotion` à null

**Étape 2 — choix de la sous-émotion :**
- Liste des sous-émotions pour l'émotion choisie (chargées depuis l'API)
- Clic sur une sous-émotion → la sélectionne
- Le bouton "Validation" est **désactivé** tant qu'aucune sous-émotion n'est choisie : `disabled={!selectedSubEmotion}`

**Envoi final :**

```ts
const handleFinalValidation = async () => {
  const res = await fetch("/api/emotions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: parsedDate.toISOString(),  // date en format ISO (ex: "2026-05-05T00:00:00.000Z")
      kind: selectedEmotion,
      subEmotion: selectedSubEmotion,
    }),
  })

  if (!res.ok) {
    const data = await res.json()
    setError(data.error ?? "Une erreur est survenue.")
    return  // on arrête là → pas de redirection
  }

  window.location.href = "/"  // hard redirect vers l'accueil (recharge la page)
}
```

---

### API Émotions — `GET /api/emotions`

```ts
export const GET = async () => {
  // 1. Récupère la session depuis le JWT (serveur)
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  // 2. Récupère l'id du user depuis la session
  const userId = (session.user as { id: string }).id

  // 3. Cherche TOUTES ses émotions, triées du plus récent
  const emotions = await prisma.emotionEntry.findMany({
    where: { userId },              // seulement les émotions de CE user
    orderBy: { date: "desc" },
  })

  return NextResponse.json({ emotions })
}
```

### API Émotions — `POST /api/emotions`

```ts
export const POST = async (req: Request) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) return 401  // non connecté → refus

  const userId = (session.user as { id: string }).id
  const { date, kind, subEmotion } = await req.json()

  // Validation : les 3 champs sont obligatoires
  if (!date || !kind || !subEmotion) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 })
  }

  const entry = await prisma.emotionEntry.create({
    data: {
      date: new Date(date),  // conversion string ISO → objet Date
      kind,
      subEmotion,
      userId,
    },
  })

  return NextResponse.json({ entry }, { status: 201 })
}
```

---

## Calendrier d'émotions

### Fichier : `src/features/emotions/views/EmotionCalendar.tsx`

**States :**
```ts
const [isLoading, setIsLoading]         = useState(true)          // skeleton pendant le fetch
const [selectedDate, setSelectedDate]   = useState(dayjs())        // date affichée dans le calendrier
const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month")
const [entries, setEntries]             = useState<EmotionEntry[]>([])  // toutes les émotions du user
```

**Chargement au montage (une seule fois) :**

```ts
React.useEffect(() => {
  fetch("/api/emotions")
    .then(res => res.json())
    .then(data => {
      setEntries(
        (data.emotions ?? []).map(e => ({
          date: dayjs(e.date).format("YYYY-MM-DD"),  // normalise en "2026-05-04" pour comparer facilement
          kind: e.kind,
        }))
      )
      setIsLoading(false)  // cache le skeleton
    })
}, [])  // [] = s'exécute une seule fois au montage
```

---

### Composant EmotionDay — chaque case du calendrier

```ts
function EmotionDay(props) {
  const { emotionEntries = [], day, outsideCurrentMonth, ...other } = props

  // Cherche si ce jour a une émotion (seulement pour les jours du mois courant)
  const entry = !outsideCurrentMonth
    ? emotionEntries.find(e => dayjs(e.date).isSame(day, "day"))
    : undefined

  return (
    <Box sx={{ position: "relative" }}>
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        sx={entry ? {
          backgroundColor: `${EMOTION_COLORS[entry.kind]}22`,  // fond coloré transparent
          border: `1px solid ${EMOTION_COLORS[entry.kind]}`,   // bordure colorée
          fontWeight: 700,
        } : {}}
      />

      {/* Badge emoji en haut à droite si le jour a une émotion */}
      {entry && (
        <Box sx={{ position: "absolute", top: -4, right: -4, ... }}>
          <FluentEmoji emoji={EMOTION_EMOJIS[entry.kind]} size={12} />
        </Box>
      )}
    </Box>
  )
}
```

---

### Calcul de l'émotion dominante

```ts
// 1. Calcule le début et fin de la période sélectionnée
const periodStart =
  selectedPeriod === "week"  ? selectedDate.startOf("isoWeek") :  // lundi de la semaine
  selectedPeriod === "year"  ? selectedDate.startOf("year")    :  // 1er janvier
  selectedDate.startOf("month")                                   // 1er du mois

const periodEnd = /* pareil avec endOf */

// 2. Filtre les entrées dans cette période
const periodEntries = entries.filter(e => {
  const d = dayjs(e.date)
  return !d.isBefore(periodStart, "day") && !d.isAfter(periodEnd, "day")
})

// 3. Groupe par émotion et compte les occurrences
const grouped = allKinds
  .map(kind => ({
    kind,
    count: periodEntries.filter(e => e.kind === kind).length
  }))
  .filter(e => e.count > 0)          // on ignore les émotions à 0
  .sort((a, b) => b.count - a.count) // tri décroissant → la dominante est en [0]

const dominant = grouped[0]  // émotion la plus présente sur la période

// 4. Les barres de progression
// max = count de la dominante → elle est toujours à 100%
// Les autres sont proportionnelles
const max = dominant?.count ?? 1
// value = (count de cette émotion / max) * 100
```

---

## Articles publics

### Fichiers impliqués

| Fichier | Rôle |
|---------|------|
| `src/features/articles/views/ArticlesPage.tsx` | Affichage des articles |
| `src/app/api/ressources/route.ts` | API GET (public) + POST (admin) |

---

### ArticlesPage

```ts
const [resources, setResources] = useState<Resource[]>([])

// Chargement au montage — pas besoin d'être connecté
React.useEffect(() => {
  fetch("/api/ressources")
    .then(res => res.json())
    .then(data => setResources(data.resources ?? []))
    // ?? [] : si data.resources est null/undefined, on utilise un tableau vide
}, [])
```

**Rendu conditionnel :**

```tsx
{resources.length === 0
  ? <Typography>Aucun article pour l'instant.</Typography>
  : resources.map(resource => (
      <Paper key={resource.id}>
        {resource.imageUrl && <img src={resource.imageUrl} />}  {/* image optionnelle */}
        <Chip label={`${resource.readingTime} min`} />
        <Typography>{resource.title}</Typography>
        <Typography>{resource.content}</Typography>
      </Paper>
    ))
}
```

---

### API Articles

**GET /api/ressources — public** (pas de vérification session) :

```ts
export const GET = async () => {
  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" }  // les plus récents en premier
  })
  return NextResponse.json({ resources })
}
```

**POST /api/ressources — admin uniquement** :

```ts
export const POST = async (req: Request) => {
  const session = await getServerSession(authOptions)

  // Double vérification : connecté ET admin
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    //                                                            ^^^ 403 = Forbidden
  }

  const { title, content, imageUrl, readingTime } = await req.json()

  // Validation des champs obligatoires
  if (!title || !content || !readingTime) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 })
  }

  const resource = await prisma.resource.create({
    data: {
      title,
      content,
      imageUrl: imageUrl || null,         // chaîne vide → null en base
      readingTime: Number(readingTime),   // conversion string → nombre
      userId,                             // l'id de l'admin connecté
    },
  })

  return NextResponse.json({ resource }, { status: 201 })
}
```

---

## Panel Admin

### 6a. Gestion des articles — ResourceAdminPage

#### Le formulaire create/update unifié

```ts
// State : null = mode création, "abc123" = mode modification
const [editingId, setEditingId] = useState<string | null>(null)

// On utilise la même URL et la même fonction selon le mode
const handleSubmit = async () => {
  const url    = editingId ? `/api/ressources/${editingId}` : "/api/ressources"
  const method = editingId ? "PUT"                          : "POST"

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...form, readingTime: Number(form.readingTime) }),
  })

  if (!res.ok) {
    setError(data.error ?? "Une erreur est survenue.")
    return
  }

  // Succès : reset le formulaire + rechargement de la liste
  setForm(emptyForm)
  setEditingId(null)
  fetchResources()
}
```

#### Les autres actions

```ts
// Clic sur "Modifier" → pré-remplit le formulaire
const handleEdit = (resource: Resource) => {
  setEditingId(resource.id)  // passe en mode modification
  setForm({
    title: resource.title,
    content: resource.content,
    imageUrl: resource.imageUrl ?? "",       // null → chaîne vide pour le champ
    readingTime: String(resource.readingTime),  // nombre → string pour le champ
  })
}

// Clic sur "Supprimer" → appel API + refresh
const handleDelete = async (id: string) => {
  await fetch(`/api/ressources/${id}`, { method: "DELETE" })
  fetchResources()
}

// Clic sur "Annuler" → reset tout
const handleCancel = () => {
  setForm(emptyForm)
  setEditingId(null)
  setError("")
}
```

**`canSubmit`** : bouton désactivé si un champ obligatoire est vide :

```ts
const canSubmit = !!form.title && !!form.content && !!form.readingTime
// !! convertit en boolean : "" → false, "texte" → true
```

#### API PUT et DELETE

```ts
// PUT /api/ressources/[id] — modifier
export const PUT = async (req, { params }) => {
  // Vérification admin (même logique que POST)
  if (role !== "ADMIN") return 403

  const { id } = await params  // id de l'article dans l'URL
  const { title, content, imageUrl, readingTime } = await req.json()

  const resource = await prisma.resource.update({
    where: { id },
    data: { title, content, imageUrl: imageUrl || null, readingTime: Number(readingTime) },
  })
  return NextResponse.json({ resource })
}

// DELETE /api/ressources/[id] — supprimer
export const DELETE = async (_req, { params }) => {
  if (role !== "ADMIN") return 403
  const { id } = await params
  await prisma.resource.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
```

---

### 6b. Gestion des sous-émotions — EmotionAdminPage

#### Stratégie de chargement

```ts
// On charge TOUTES les sous-émotions en une requête
const [subEmotions, setSubEmotions] = useState<SubEmotion[]>([])

// Puis on filtre côté client selon l'émotion sélectionnée
const filtered = subEmotions.filter(s => s.kind === selectedKind)
// → pas besoin de refaire un appel API à chaque changement d'onglet
```

#### Ajouter une sous-émotion

```ts
const handleAdd = async () => {
  if (!newLabel.trim()) return  // trim() retire les espaces → évite "   " comme label

  await fetch("/api/admin/sub-emotions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label: newLabel.trim(), kind: selectedKind }),
  })

  setNewLabel("")     // vide le champ
  fetchSubEmotions()  // recharge la liste
}

// On peut aussi appuyer sur Entrée
onKeyDown={(e) => { if (e.key === "Enter") handleAdd() }}
```

#### API admin/sub-emotions — pattern `requireAdmin`

```ts
// Fonction helper pour éviter de répéter le code de vérification
const requireAdmin = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) return "Non autorisé"        // pas connecté → 401
  if (role !== "ADMIN") return "Accès refusé"      // pas admin → 403
  return null                                      // tout va bien
}

export const GET = async () => {
  const err = await requireAdmin()
  if (err) return NextResponse.json({ error: err }, {
    status: err === "Non autorisé" ? 401 : 403     // bon code HTTP selon le cas
  })

  const subEmotions = await prisma.subEmotion.findMany({
    orderBy: [{ kind: "asc" }, { createdAt: "asc" }]  // trié par émotion puis par date
  })
  return NextResponse.json({ subEmotions })
}
```

---

## Infrastructure

### Prisma Client — `src/lib/prisma.ts`

```ts
import "server-only"  // empêche l'import de ce fichier côté client (sécurité)

// Création d'un pool de connexions PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
// PrismaPg = adaptateur entre Prisma et le driver pg
const adapter = new PrismaPg(pool)

// Pattern Singleton : évite les connexions multiples
// Problème : Next.js en dev recharge les modules (hot-reload) mais PAS globalThis
// Sans ça : à chaque sauvegarde, on crée une nouvelle pool → on épuise la BDD
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma  // mémorise l'instance dans globalThis en dev
}
// En prod : les modules ne rechargent pas → pas besoin
```

---

### Layout global — `src/app/layout.tsx`

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        {/* Providers = SessionProvider de NextAuth → rend useSession() accessible partout */}
        <Providers>
          <div className="mobile-top-logo">...</div>
          <div className="page-content">{children}</div>  {/* les pages s'affichent ici */}
          <footer>
            <PwaInstallButton />          {/* bouton "Installer l'app" */}
            <PushNotificationManager />   {/* gestion notifications push */}
            © 2025 Cesizen — Ministère de la santé et de la prévention
          </footer>
        </Providers>

        {/* Enregistrement du Service Worker après chargement de la page */}
        <Script strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
          }
        `}</Script>
      </body>
    </html>
  )
}
```

### Providers — `src/app/providers.tsx`

```tsx
// SessionProvider = contexte NextAuth
// Doit entourer toute l'app pour que useSession() fonctionne dans les composants enfants
export function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

---

## Les tests expliqués

### Configuration

**`vitest.config.ts` :**
```ts
environment: "jsdom"   // simule un vrai navigateur dans Node.js (DOM, window, etc.)
setupFiles: ["./src/test/setup.ts"]  // fichier chargé avant chaque test
```

**`src/test/setup.ts` :**
```ts
import "@testing-library/jest-dom"
// Ajoute des matchers spéciaux :
// toBeInTheDocument() → vérifie qu'un élément est dans le DOM
// toBeDisabled()       → vérifie qu'un bouton est désactivé
// toHaveAttribute()    → vérifie un attribut HTML
```

---

### Ce que font les mocks (vi.mock)

> Un **mock** remplace un module réel par une version simulée pour les tests.
> Sans mocks, les tests feraient de vraies requêtes réseau, des vraies redirections, etc.

```ts
// Remplace next/link par un simple <a> → évite les erreurs Next.js en dehors de son contexte
vi.mock("next/link", () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>
}))

// Remplace useRouter par une version factice → pas de vraie navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() })
}))

// Remplace signIn de NextAuth → pas de vrai appel d'auth
vi.mock("next-auth/react", () => ({
  signIn: vi.fn()
}))

// Remplace fetch global → on contrôle les réponses
const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)
```

---

### Tests LoginForm — 4 tests

| # | Nom du test | Ce qu'il vérifie | Méthode utilisée |
|---|-------------|-----------------|-----------------|
| 1 | affiche les champs | Les placeholders existent dans le DOM | `getByPlaceholderText()` |
| 2 | lien inscription | Lien "Créer votre compte" pointe vers `/register` | `getByRole("link")` + `toHaveAttribute("href", "/register")` |
| 3 | bouton désactivé vide | Bouton "Suivant" est disabled si rien n'est tapé | `getByRole("button")` + `toBeDisabled()` |
| 4 | bouton actif rempli | Bouton devient enabled après saisie | `userEvent.type()` + `toBeEnabled()` |

---

### Tests RegisterForm — 9 tests

**Helper `goToStep(user, n)` :** simule les clics pour atteindre l'étape n sans répéter dans chaque test.

```ts
// Exemple d'utilisation dans un test :
await goToStep(user, 3)  // remplit Nom, Prénom, Email et clique Suivant 3 fois
// → on arrive directement à l'étape du mot de passe
```

| # | Nom du test | Ce qu'il vérifie |
|---|-------------|-----------------|
| 1 | première étape | "Votre nom" et champ Nom présents au départ |
| 2 | lien connexion | Lien "Se connecter" pointe vers `/login` |
| 3 | bouton désactivé | Suivant disabled si champ vide |
| 4 | passe à l'étape suivante | Après saisie + clic, on voit "Votre prénom" |
| 5 | erreur mots de passe | Message d'erreur si mdp ≠ confirmation |
| 6 | bouton créer disabled | Bouton "Créer mon compte" disabled si mdp ne correspondent pas |
| 7-9 | envoi API | `mockFetch` appelé avec `/api/auth/register` |

**Exemple du test d'envoi API :**

```ts
it("envoie les données à l'API lors de la soumission", async () => {
  // On configure le mock : si fetch est appelé, il retourne { ok: true }
  mockFetch.mockResolvedValueOnce({ ok: true })

  const user = userEvent.setup()
  render(<RegisterForm />)
  await goToStep(user, 3)  // on arrive à l'étape mot de passe
  await user.type(screen.getByPlaceholderText("Mot de passe"), "motdepasse123")
  await user.type(screen.getByPlaceholderText("Confirmation mot de passe"), "motdepasse123")
  await user.click(screen.getByRole("button", { name: /créer mon compte/i }))

  // Vérifie que fetch a bien été appelé avec la bonne URL
  expect(mockFetch).toHaveBeenCalledWith("/api/auth/register", expect.any(Object))
})
```

---

### Tests AuthShell — 4 tests

> AuthShell est un composant "bête" : il affiche juste ce qu'on lui passe en props. Les tests vérifient ça.

```ts
it("affiche le titre passé en prop", () => {
  render(<AuthShell title="Connexion" description="..."><div /></AuthShell>)
  expect(screen.getByText("Connexion")).toBeInTheDocument()
})

it("n'affiche pas un titre qui n'a pas été fourni", () => {
  render(<AuthShell title="Connexion" description="..."><div /></AuthShell>)
  // queryByText → retourne null si pas trouvé (getByText lèverait une erreur)
  expect(screen.queryByText("Inscription")).not.toBeInTheDocument()
})
```

---

### Tests EmotionCalendar — 7 tests

**Mock FluentEmoji :** les vrais emojis chargent des images depuis internet → on les remplace par un `<span>` :

```ts
vi.mock("@lobehub/fluent-emoji", () => ({
  FluentEmoji: ({ emoji }) => <span>{emoji}</span>
}))
```

**`beforeEach` :** avant chaque test, le mock fetch retourne `{ emotions: [] }` → état propre garanti.

**Différence `getBy` vs `findBy` :**

```ts
// getByText → synchrone, échoue immédiatement si l'élément n'est pas là
expect(screen.getByText("Ton calendrier du mois")).toBeInTheDocument()

// findByText → asynchrone, ATTEND que l'élément apparaisse (utile après un fetch)
// À utiliser quand le contenu est chargé après une requête réseau
expect(await screen.findByText(/aucune emotion disponible/i)).toBeInTheDocument()
```

| # | Nom du test | Synchrone ou async |
|---|-------------|-------------------|
| 1 | titre calendrier | sync |
| 2 | label suivi émotionnel | sync |
| 3 | bouton "Mon emotion du jour" | sync |
| 4 | 3 filtres de période | sync |
| 5 | message si aucune émotion | **async** (`findByText`) |
| 6 | émotion dominante après chargement | **async** (`findByText`) |

**Test avec données simulées :**

```ts
it("affiche l'émotion dominante après le chargement", async () => {
  const today = dayjs().format("YYYY-MM-DD")

  // mockResolvedValueOnce = pour CE test précis, fetch retourne cette réponse
  mockFetch.mockResolvedValueOnce({
    json: async () => ({ emotions: [{ date: today, kind: "joy" }] }),
  })

  render(<EmotionCalendar />)
  // On attend que "emotion dominante" apparaisse dans le DOM
  expect(await screen.findByText(/emotion dominante/i)).toBeInTheDocument()
})
```

---

### Tests ArticlesPage — 3 tests

```ts
// Mock du header → null (sinon le header fait des appels qui cassent le test)
vi.mock("@/shared/ui/layout/PublicHeader", () => ({
  PublicHeader: () => null
}))

// beforeEach : fetch retourne { resources: [] } par défaut
beforeEach(() => {
  mockFetch.mockResolvedValue({ json: async () => ({ resources: [] }) })
})
```

| # | Nom du test | Ce qu'il vérifie |
|---|-------------|-----------------|
| 1 | label "Articles" | Le texte "Articles" est présent (sync) |
| 2 | titre principal | "Ressources et contenus" est présent (sync) |
| 3 | aucun article | "Aucun article pour l'instant." (async, attend le fetch) |

---

## Questions du jury — réponses prêtes

---

**"Pourquoi Next.js ?"**

> Next.js permet de faire le front ET le back dans le même projet grâce aux API Routes. Pas besoin d'un serveur Express séparé. L'App Router permet aussi le rendu côté serveur pour de meilleures performances.

---

**"Comment vous sécurisez les routes admin ?"**

> Double protection :
> 1. Le **middleware** bloque l'accès aux pages si l'utilisateur n'est pas connecté → redirige vers `/login`.
> 2. Chaque **API admin** vérifie `session.user.role === "ADMIN"` côté serveur.
>
> Même si quelqu'un contourne le front, l'API refuse la requête.

---

**"Pourquoi bcrypt avec 10 tours ?"**

> Bcrypt est un algorithme conçu pour être lent. 10 tours = environ 100ms par hash, ce qui est invisible pour l'utilisateur mais rend une attaque brute-force extrêmement coûteuse. On ne peut pas simplement déchiffrer un hash bcrypt, il faut tester chaque possibilité.

---

**"Pourquoi JWT et pas sessions en base ?"**

> JWT = stateless. Le token contient lui-même les infos (id, rôle). Pas besoin d'une table de sessions en base de données. NextAuth stocke ce token dans un cookie `httpOnly` (inaccessible en JavaScript côté client, protégé contre le XSS).

---

**"Que se passe-t-il si on supprime une sous-émotion qu'un user a déjà utilisée ?"**

> Rien de cassé. `EmotionEntry.subEmotion` stocke le **label** (String), pas une clé étrangère vers `SubEmotion`. L'historique de l'utilisateur est préservé même si l'admin supprime la sous-émotion plus tard. C'est un choix de conception délibéré.

---

**"Pourquoi un singleton Prisma ?"**

> En développement, Next.js recharge les modules à chaque sauvegarde (hot-reload) mais pas `globalThis`. Sans singleton, chaque rechargement créerait une nouvelle pool de connexions et on épuiserait rapidement la base de données. En production, le problème ne se pose pas car les modules sont chargés une seule fois.

---

**"C'est quoi une PWA ?"**

> Progressive Web App : une app web installable sur téléphone comme une app native. Elle nécessite :
> - Un `manifest.json` (nom, icône, couleurs, mode d'affichage)
> - Un Service Worker (script qui tourne en arrière-plan, permet le mode offline)
>
> Dans Cesizen : `manifest.ts` génère le manifest, `service-worker.js` gère le cache, et le bouton `PwaInstallButton` déclenche l'installation.

---

**"Comment les tests évitent les vrais appels réseau ?"**

> `vi.stubGlobal("fetch", mockFetch)` remplace la fonction `fetch` globale par une fonction Vitest contrôlée. On lui dit exactement ce qu'elle doit retourner avec `mockResolvedValue(...)`. Même chose pour NextAuth avec `vi.mock("next-auth/react")` — le vrai appel d'auth est remplacé par une fonction vide.

---

**"Pourquoi `subEmotion` est une String et pas une relation ?"**

> C'est intentionnel. Si c'était une clé étrangère vers `SubEmotion`, supprimer une sous-émotion effacerait ou invaliderait l'historique des utilisateurs (contrainte d'intégrité). En stockant le label comme texte au moment de l'enregistrement, on préserve l'historique indépendamment des modifications futures des admins.

---

## Flux complets à connaître par cœur

### Inscription

```
RegisterForm (4 étapes)
  → POST /api/auth/register
    → vérif email unique
    → bcrypt.hash(password, 10)
    → prisma.user.create (role USER par défaut)
  → redirect /login
```

---

### Connexion

```
LoginForm
  → signIn("credentials", { email, password })
    → NextAuth authorize()
      → prisma.user.findUnique (par email)
      → bcrypt.compare(password, hash)
      → retourne { id, email, name, role }
    → callbacks jwt() → ajoute id + role dans le token
    → callbacks session() → recopie dans la session
  → redirect /
```

---

### Enregistrer une émotion

```
/emotions/tracker
  → fetch GET /api/sub-emotions?kind=joy (public)
  → Étape 1 : user choisit l'émotion principale
  → Étape 2 : user choisit la sous-émotion
  → POST /api/emotions
    → getServerSession → vérif connecté
    → prisma.emotionEntry.create
  → window.location.href = "/"
```

---

### Voir le calendrier

```
HomePage → EmotionCalendar
  → GET /api/emotions (protégé)
    → getServerSession → userId
    → prisma.emotionEntry.findMany({ where: { userId } })
  → affichage par mois
  → calcul émotion dominante sur la période sélectionnée
```

---

### Admin : créer un article

```
ResourceAdminPage
  → POST /api/ressources
    → getServerSession → vérif ADMIN
    → validation (title, content, readingTime obligatoires)
    → prisma.resource.create
  → fetchResources() → refresh la liste
```

---

*Document généré pour la soutenance du 06/05/2026*
