# Guide complet — Site opérationnel (Netlify + Render + MySQL)

> **Peu de temps ?** Voir [DEPLOIEMENT-RAPIDE.md](./DEPLOIEMENT-RAPIDE.md) (Blueprint Render + 1 variable Netlify).  
> Le fichier `render.yaml` à la racine du repo permet de créer l’API depuis le dashboard Render en un clic.

# Guide complet — Site opérationnel (Netlify + Render + MySQL)

Objectif : **toutes les fonctionnalités** (connexion, panier, commandes, admin, studio, notifications), pas seulement les pages vitrine.

## Architecture (obligatoire)

Netlify **ne peut pas** faire tourner NestJS + MySQL. Il héberge uniquement le **frontend Next.js**.

```
Utilisateur
    │
    ├─► https://votre-site.netlify.app     →  Frontend (Netlify)
    │
    └─► https://votre-api.onrender.com    →  API NestJS (Render)
              │
              └─► MySQL (Render, Railway, PlanetScale…)
```

Votre dépôt GitHub est déjà sur Render : on configure **l’API + la base**, puis **Netlify** pointe vers cette API.

---

## Partie A — Base MySQL

Render ne propose pas toujours MySQL managé selon le plan. Options simples :

| Fournisseur | Note |
|-------------|------|
| **Railway** | MySQL en un clic, bon pour démarrer |
| **PlanetScale** | MySQL serverless, gratuit limité |
| **Aiven** | Essai MySQL |

### Créer la base

1. Créez une base nommée **`mayn`** (utf8mb4).
2. Notez : **hôte**, **port**, **utilisateur**, **mot de passe**.

---

## Partie B — API NestJS sur Render

### 1. Nouveau Web Service

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**
2. Connectez le repo **DahbiArt** (GitHub)
3. Paramètres :

| Champ | Valeur |
|--------|--------|
| **Name** | `dahbiart-api` (ou autre) |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Instance type** | Free (ok pour tester ; mise en veille après inactivité) |

### 2. Variables d’environnement (Render → Environment)

Copiez depuis `backend/.env.example` et adaptez :

```env
NODE_ENV=production
PORT=3001

DB_HOST=votre-hote-mysql
DB_PORT=3306
DB_USERNAME=...
DB_PASSWORD=...
DB_DATABASE=mayn

# UNIQUEMENT au tout premier déploiement (crée les tables), puis supprimez ou mettez false
DB_SYNCHRONIZE=true

JWT_SECRET=mettez-une-longue-chaine-aleatoire-32-caracteres-minimum
JWT_EXPIRES_IN=7d

ADMIN_EMAIL=admin@votredomaine.com
ADMIN_PASSWORD=MotDePasseAdminFort123!

# URL Netlify — à mettre à jour après l’étape C (provisoire : http://localhost:3000)
FRONTEND_URL=https://votre-site.netlify.app

SHIPPING_DELAY_DAYS=3
SHIPPING_FLAT_EUR=0

# Paiement test en prod (sans Stripe) — pour tester commandes
CHECKOUT_DEV_MODE=true

# Plus tard, avec Stripe :
# CHECKOUT_DEV_MODE=false
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

**Important `DB_SYNCHRONIZE`** : laissez `true` pour le **premier** déploiement réussi (tables créées). Ensuite repassez à `false` ou supprimez la variable et redéployez.

**Important `FRONTEND_URL`** : doit être **exactement** l’URL Netlify (sans slash final), ex. `https://dahbi-art.netlify.app`. Sinon : erreurs CORS à la connexion.

### 3. Premier déploiement Render

1. **Create Web Service** → attendez **Live**
2. Testez dans le navigateur :  
   `https://dahbiart-api.onrender.com/health`  
   Réponse attendue : statut OK / base connectée

3. Si échec DB : vérifiez host/user/password et que MySQL accepte les connexions externes (whitelist IP `0.0.0.0/0` ou IP Render selon le fournisseur).

4. Après tables créées : `DB_SYNCHRONIZE=false` → **Manual Deploy**

### 4. Compte admin

Au démarrage, l’API crée/synchronise l’admin avec `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Connectez-vous sur le site une fois Netlify en ligne : `/login` puis `/admin`.

---

## Partie C — Frontend sur Netlify

### 1. Nouveau site

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
2. **GitHub** → repo **DahbiArt**
3. Netlify détecte le `netlify.toml` à la racine :

```toml
base = "frontend"
command = "npm ci && npm run build"
plugin = @netlify/plugin-nextjs
```

**Ne pas** utiliser `npm run build:netlify` (export statique = pas d’auth).

### 2. Variable obligatoire

**Site configuration** → **Environment variables** → **Add a variable** :

| Clé | Valeur |
|-----|--------|
| `NEXT_PUBLIC_API_URL` | `https://dahbiart-api.onrender.com` (votre URL Render **sans** slash final) |

**Scope** : All scopes (Production + Deploy previews).

### 3. Déployer

**Deploy site** (ou push sur `main`).  
URL du type : `https://something.netlify.app`

### 4. Mettre à jour CORS sur Render

Retournez sur Render → **Environment** :

```env
FRONTEND_URL=https://something.netlify.app
```

(Remplacez par votre vraie URL Netlify.)  
**Save** → Render redéploie l’API.

---

## Partie D — Checklist « tout fonctionne »

Ouvrez la console navigateur (F12) sur le site Netlify.

| Test | URL / action | OK si |
|------|----------------|-------|
| API joignable | `https://votre-api.onrender.com/health` | Réponse positive |
| Catalogue | `/paintings` | Tableaux visibles |
| Inscription | `/register` | Compte créé, pas d’erreur CORS |
| Connexion | `/login` | Redirection compte / admin |
| Admin | `/admin` | Tableau de bord (compte admin) |
| Panier / checkout | achat test | Commande créée (`CHECKOUT_DEV_MODE=true`) |
| Commandes staff | `/commande` | Rôle `commande` ou admin |
| Notifications | cloche header | Après une action (commande, etc.) |

### Erreurs fréquentes

| Symptôme | Cause | Solution |
|----------|--------|----------|
| `Failed to fetch` | API arrêtée ou mauvaise URL | Vérifier Render Live + `NEXT_PUBLIC_API_URL` |
| CORS blocked | `FRONTEND_URL` incorrect | URL Netlify exacte sur Render |
| 401 / login impossible | JWT ou admin | `JWT_SECRET`, `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| Tables manquantes | Prod sans sync | `DB_SYNCHRONIZE=true` une fois |
| Render très lent au 1er clic | Plan free (cold start) | Attendre 30–60 s ou passer au plan payant |

---

## Partie E — Stripe (vrais paiements, optionnel)

1. Render : `CHECKOUT_DEV_MODE=false`
2. Ajoutez `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
3. Netlify : `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (si utilisé côté front)
4. Webhook Stripe → `https://votre-api.onrender.com/checkout/webhook` (vérifiez la route exacte dans `checkout.controller.ts`)

---

## Partie F — Uploads images (admin / studio)

En local, les uploads vont dans `frontend/public/`. Sur Render, le disque est **éphémère** : les nouvelles images uploadées via l’admin peuvent **disparaître** au redémarrage.

- Les images **déjà dans Git** (`frontend/public/paintings/`, etc.) : OK sur Netlify.
- Nouveaux uploads en production : prévoir plus tard S3 / Cloudinary, ou déployer les images via Git.

---

## Résumé des URLs à noter

| Où | Variable | Exemple |
|----|----------|---------|
| Netlify | `NEXT_PUBLIC_API_URL` | `https://dahbiart-api.onrender.com` |
| Render | `FRONTEND_URL` | `https://dahbi-art.netlify.app` |
| Render | MySQL `DB_*` | selon votre hébergeur DB |

---

## Ordre recommandé

1. MySQL créée  
2. Render API déployée + `health` OK + `DB_SYNCHRONIZE` puis `false`  
3. Netlify déployé + `NEXT_PUBLIC_API_URL`  
4. `FRONTEND_URL` mis à jour sur Render  
5. Tests login / admin / commande  

Besoin d’aide sur une étape précise (Render MySQL, erreur de build Netlify) : indiquez le message d’erreur et l’étape.
