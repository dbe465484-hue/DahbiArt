# Déploiement Vercel — front + back en un seul projet

Un seul projet Vercel, **un clic Deploy** : site Next.js (`/`) + API NestJS (`/api`).

Config : `vercel.json` à la racine avec **Services** (`experimentalServices`).

```
https://dahbi-art.vercel.app/          → frontend (Next.js)
https://dahbi-art.vercel.app/api/health → backend (NestJS)
```

---

## 1. Importer le repo

1. [vercel.com](https://vercel.com) → **Add New…** → **Project** → **DahbiArt**
2. **Root Directory** : `./` (racine du repo — **pas** `frontend` seul)
3. **Framework Preset** : **Services** (si proposé). Sinon laisser la détection après le `vercel.json` racine.
4. Vercel doit afficher **deux services** :
   - `frontend` → Next.js → `/`
   - `backend` → NestJS → `/api`

Si `frontend` pointe vers `/` au lieu de `frontend/` : faites **Edit** sur la structure et corrigez vers le dossier `frontend`.

---

## 2. Variables d’environnement (projet entier)

| Variable | Service | Valeur |
|----------|---------|--------|
| `DATABASE_URL` | backend | (Neon / PlanetScale via **Storage**) |
| `DB_SYNCHRONIZE` | backend | `true` puis `false` |
| `JWT_SECRET` | backend | chaîne aléatoire longue |
| `ADMIN_EMAIL` | backend | email admin |
| `ADMIN_PASSWORD` | backend | mot de passe |
| `CHECKOUT_DEV_MODE` | backend | `true` (sans Stripe) |
| `SEED_PAINTINGS` | backend | `true` (optionnel, 1ère fois) |

**Ne pas** définir `NEXT_PUBLIC_API_URL` : Vercel injecte `NEXT_PUBLIC_BACKEND_URL=/api` automatiquement.

`FRONTEND_URL` est aussi injecté automatiquement pour le service `frontend`.

---

## 3. Base de données

**Storage** → Marketplace → **Neon** (Postgres) ou **PlanetScale** (MySQL) → lier au projet.

---

## 4. Build (laisser par défaut)

| Service | Build | Install |
|---------|-------|---------|
| frontend | `npm run build` | `npm install` |
| backend | `npm run build` | `npm install` |

Ne pas utiliser `build:netlify`.

---

## 5. Deploy

**Deploy** une fois → les deux services partent ensemble.

### Tests

| URL | Attendu |
|-----|---------|
| `/` | Site |
| `/api/health` | `{ "database": "connected" }` |
| `/login` | Page connexion |
| `/admin` | Admin |

---

## Développement local

```bash
# API seule (sans préfixe)
cd backend && npm run start:dev

# Site → http://localhost:3000 , API → http://localhost:3001
```

Avec Services en local (CLI 48.4+) :

```bash
npx vercel dev -L
```

---

## Option : 2 projets séparés

Si **Services** n’apparaît pas sur votre compte :

| Projet | Root Directory |
|--------|----------------|
| `dahbiart-api` | `backend` |
| `dahbiart-web` | `frontend` + `NEXT_PUBLIC_API_URL` = URL de l’API |

---

## Dépannage

| Erreur | Solution |
|--------|----------|
| No Next.js version detected | Root = `./` et service `frontend` → dossier `frontend` |
| API 404 | Tester `/api/health` (pas `/health` sur le domaine principal) |
| Failed to fetch | Vérifier que le deploy backend a réussi |
| CORS | Même domaine avec `/api` — normalement OK |
