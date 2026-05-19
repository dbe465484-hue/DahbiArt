# Déploiement 100 % Vercel

Tout passe par [vercel.com](https://vercel.com) : **site Next.js**, **API NestJS**, **base de données** (via le Marketplace Vercel, ex. Neon ou PlanetScale).

```
                    ┌─────────────────────────────────┐
                    │           Vercel              │
                    │  ┌─────────┐    ┌──────────┐  │
                    │  │  site   │───▶│   API    │  │
                    │  │ (Next)  │    │ (NestJS) │  │
                    │  └─────────┘    └────┬─────┘  │
                    │                      │        │
                    │              Marketplace DB     │
                    └─────────────────────────────────┘
```

**2 projets Vercel** (même repo GitHub `DahbiArt`) :

| Projet Vercel | Root Directory | Rôle |
|---------------|----------------|------|
| `dahbiart-api` (nom au choix) | `backend` | API + JWT + commandes |
| `dahbiart-web` | `frontend` | Site + admin |

---

## Étape 1 — Compte et repo

1. [vercel.com](https://vercel.com) → connexion **GitHub**
2. Repo : **dbe465484-hue/DahbiArt** (branche `main`)

---

## Étape 2 — Projet API (`backend`)

1. **Add New…** → **Project** → **DahbiArt**
2. **Project Name** : `dahbiart-api`
3. **Root Directory** : `backend` (Edit → cocher `backend`)
4. **Framework Preset** : Other (ou NestJS si proposé)
5. Ne pas utiliser `build:netlify` — laisser `npm run build`

### Base de données (Marketplace)

Sur le projet **dahbiart-api** :

1. **Storage** → **Create Database** / **Browse Marketplace**
2. Choisir **Neon** (Postgres, recommandé) ou **PlanetScale** (MySQL)
3. Créer la base → Vercel injecte `DATABASE_URL` (ou `POSTGRES_URL`)

### Variables d’environnement (API)

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | (auto si Neon/PlanetScale) |
| `DB_SYNCHRONIZE` | `true` au **1er** déploiement, puis `false` |
| `JWT_SECRET` | chaîne longue aléatoire |
| `JWT_EXPIRES_IN` | `7d` |
| `ADMIN_EMAIL` | votre email admin |
| `ADMIN_PASSWORD` | mot de passe fort |
| `CHECKOUT_DEV_MODE` | `true` (sans Stripe) ou `false` + clés Stripe |
| `FRONTEND_URL` | à remplir après l’étape 3 (URL du site) |
| `SEED_PAINTINGS` | `true` (optionnel, 1ère fois) |

6. **Deploy**

7. Tester : `https://dahbiart-api.vercel.app/health` → `"database":"connected"`

Notez l’URL API : `https://dahbiart-api.vercel.app`

---

## Étape 3 — Projet site (`frontend`)

1. **Add New…** → **Project** → **DahbiArt** (encore une fois, 2ᵉ projet)
2. **Project Name** : `dahbiart-web`
3. **Root Directory** : `frontend`
4. **Framework** : Next.js

### Variables (site)

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://dahbiart-api.vercel.app` (sans `/` final) |

5. **Deploy**

6. URL du site : `https://dahbiart-web.vercel.app`

---

## Étape 4 — Relier site ↔ API

Retour projet **dahbiart-api** → **Settings** → **Environment Variables** :

```env
FRONTEND_URL=https://dahbiart-web.vercel.app
```

**Redeploy** l’API (Deployments → … → Redeploy).

Sur le **site**, si vous changez `NEXT_PUBLIC_API_URL`, **Redeploy** le frontend.

---

## Étape 5 — Vérifications

| Test | URL |
|------|-----|
| API | `https://dahbiart-api.vercel.app/health` |
| Accueil API | `https://dahbiart-api.vercel.app/` |
| Site | `https://dahbiart-web.vercel.app` |
| Login | `/login` |
| Admin | `/admin` (compte `ADMIN_EMAIL` / `ADMIN_PASSWORD`) |

Après la 1ʳᵉ connexion réussie : mettre `DB_SYNCHRONIZE=false` sur l’API et redeploy.

---

## Déploiement CLI (optionnel)

```bash
npm i -g vercel
vercel login

cd backend
vercel link
vercel --prod

cd ../frontend
vercel link
vercel --prod
```

CLI minimale : **48.4.0+**

---

## Fichiers du repo

| Fichier | Rôle |
|---------|------|
| `backend/vercel.json` | Build NestJS |
| `frontend/vercel.json` | Build Next.js |
| `backend/src/app.module.ts` | Postgres (Neon) ou MySQL (PlanetScale) |

---

## Dépannage

| Problème | Piste |
|----------|--------|
| `Failed to fetch` | API down ou mauvaise `NEXT_PUBLIC_API_URL` |
| CORS | `FRONTEND_URL` = URL exacte du site (https, sans slash) |
| `database: disconnected` | Base non liée au projet API, ou `DB_SYNCHRONIZE=true` une fois |
| Build API échoue | Root Directory = `backend`, pas la racine du monorepo |
| Admin inaccessible | Ne pas utiliser `build:netlify` — utiliser `npm run build` |

---

## Railway / Render

Non requis si vous restez sur **Vercel uniquement**. Les guides Railway restent dans `docs/RAILWAY*.md` pour une autre option.
