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
| `DATABASE_URL` | backend | (Neon via **Storage**, projet **dahbi-art-api**) |
| `BLOB_READ_WRITE_TOKEN` | **dahbi-art-api** et **dahbi-art** | lier le même store Blob aux deux projets (upload direct navigateur) |
| `DB_SYNCHRONIZE` | backend | `false` en prod (ne pas forcer `true` : risque d’erreur si données incomplètes) |
| `JWT_SECRET` | backend | chaîne aléatoire longue |
| `ADMIN_EMAIL` | backend | email admin |
| `ADMIN_PASSWORD` | backend | mot de passe |
| `CHECKOUT_DEV_MODE` | backend | `true` (sans Stripe) |
| `SEED_PAINTINGS` | backend | `true` (optionnel, 1ère fois) |

**Ne pas** définir `NEXT_PUBLIC_API_URL` à `localhost` sur Vercel (sinon la boutique affiche le catalogue statique).

| Variable | Projet | Rôle |
|----------|--------|------|
| `BACKEND_INTERNAL_URL` | **dahbi-art** | URL absolue de l’API pour les pages serveur (`https://dahbi-art-api.vercel.app`) |
| `NEXT_PUBLIC_BACKEND_URL` | dahbi-art | `/api` (navigateur, rewrite) |
| `NEXT_PUBLIC_API_ORIGIN` | dahbi-art (optionnel) | Upload direct vers l’API si le domaine change |

`FRONTEND_URL` est aussi injecté automatiquement pour le service `frontend`.

---

## 3. Base de données

**Storage** → Marketplace → **Neon** (Postgres) → lier au projet **dahbi-art-api** (pas seulement le site).

Les données **locales MySQL ne sont pas migrées** automatiquement : Neon contient le catalogue seed (~36 tableaux) + ce que vous créez en prod.

---

## 3b. Images (Vercel Blob) — obligatoire pour upload admin

1. Projet Vercel **dahbi-art-api** (pas `dahbi-art` seul).
2. **Storage** → **Create Database** → **Blob**.
3. Lier le store au projet **dahbi-art-api** → Vercel ajoute `BLOB_READ_WRITE_TOKEN`.
4. **Redeploy** l’API après toute modification de cette variable.

Sans Blob : l’upload échoue et **impossible de créer** un tableau (image obligatoire).  
La modification **sans** changer l’image (titre, prix, etc.) peut quand même être enregistrée en base.

Au démarrage de l’API, le catalogue seed **n’écrase plus** les tableaux déjà en base (seuls les slugs manquants sont ajoutés). Le bouton admin **Importer le catalogue** force la mise à jour depuis le JSON.

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
