# Déploiement Mayn (site + admin + auth)

## Pourquoi Netlify « statique » ne suffit pas

Le script `npm run build:netlify` :

1. **Retire** les dossiers `src/app/admin` et `src/app/api` avant le build.
2. Produit un site **HTML/JS figé** dans `frontend/out/` — pas de serveur Node.

Résultat sur https://xxx.netlify.app :

| Fonctionnalité | Export statique (`build:netlify`) | Next.js complet (`npm run build`) |
|----------------|-----------------------------------|-----------------------------------|
| Pages catalogue / blog | Oui (données au build) | Oui |
| `/admin`, login | **Non** (dossiers exclus) | **Oui** |
| Connexion / panier / API | Non sans backend | Oui si `NEXT_PUBLIC_API_URL` pointe vers l’API |

L’**authentification et l’admin** appellent toujours l’**API NestJS** (`backend/`). Netlify ne peut pas exécuter NestJS + MySQL à la place de ce backend.

## Architecture recommandée

```
[Navigateur]
     │
     ├─► Netlify ──► Next.js (frontend)     https://votre-site.netlify.app
     │
     └─► Render / Railway / VPS ──► NestJS + MySQL   https://votre-api.example.com
```

## Étape 1 — Héberger l’API (obligatoire pour auth + admin)

Exemples : [Render](https://render.com), [Railway](https://railway.app), Fly.io, VPS.

1. Créer une base **MySQL** (managed MySQL du fournisseur).
2. Déployer le dossier `backend/` (build : `npm ci && npm run build`, start : `npm run start:prod`).
3. Variables d’environnement sur l’API :

```env
PORT=3001
DB_HOST=...
DB_PORT=3306
DB_USERNAME=...
DB_PASSWORD=...
DB_DATABASE=mayn
JWT_SECRET=une-longue-chaine-aleatoire
FRONTEND_URL=https://votre-site.netlify.app
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=...
```

4. Vérifier : `https://votre-api.example.com/health` répond OK.

## Étape 2 — Netlify en mode Next.js complet

Le fichier `netlify.toml` à la racine est configuré pour :

- `base = "frontend"`
- `npm run build` (sans export statique)
- plugin `@netlify/plugin-nextjs`

Dans **Netlify → Site settings → Environment variables** :

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://votre-api.example.com` |

Puis **Deploy** (ou push sur la branche connectée).

## Étape 3 — CORS

Le backend lit `FRONTEND_URL` (plusieurs origines possibles, séparées par des virgules) :

```env
FRONTEND_URL=https://votre-site.netlify.app,https://www.votre-domaine.com
```

Redémarrer l’API après modification.

## Étape 4 — Tester

1. `https://votre-site.netlify.app/admin/login`
2. Compte admin (valeurs `ADMIN_EMAIL` / `ADMIN_PASSWORD` du backend).
3. Création / édition d’un tableau → doit appeler l’API sans erreur CORS dans la console (F12).

## Mode vitrine seule (sans admin)

Si vous voulez uniquement le catalogue public sur Netlify :

- Utiliser `netlify.static.toml` comme modèle, ou
- Commande de build : `cd frontend && npm run build:netlify`
- Publish directory : `frontend/out`

Pas de login, pas d’admin, pas de panier dynamique.

## Alternative : tout sur Vercel + Render

- **Frontend** : Vercel (Next.js natif, même principe : `NEXT_PUBLIC_API_URL`).
- **Backend** : Render / Railway.

Même schéma : le frontend reste une app qui parle à l’API NestJS.
