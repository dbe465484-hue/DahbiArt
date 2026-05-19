# Mayn — Galerie d’art

Site de vente de tableaux (peintre) : catalogue, panier, paiement et livraison.

## GitHub

Pour lier le projet à votre compte et pousser le code : **[docs/GITHUB.md](docs/GITHUB.md)**.

## Structure

| Dossier    | Stack              | Port |
|-----------|--------------------|------|
| `backend/` | NestJS + TypeORM   | 3001 |
| `frontend/` | Next.js + Tailwind | 3000 |

## Prérequis

- Node.js 20+
- MySQL en local avec la base **`mayn`**

Créer la base si besoin :

```sql
CREATE DATABASE IF NOT EXISTS mayn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Configuration

1. **Backend** — copier `backend/.env.example` vers `backend/.env` (déjà fourni pour le dev local).
2. **Frontend** — copier `frontend/.env.example` vers `frontend/.env.local`.

## Lancer le projet

```bash
# Terminal 1 — API
cd backend
npm run start:dev

# Terminal 2 — Site
cd frontend
npm run dev
```

- Site : http://localhost:3000  
- API : http://localhost:3001  
- Santé DB : http://localhost:3001/health  

## Déployer en production (admin + auth)

**Netlify seul en export statique ne permet pas l’admin ni la connexion** : le build `build:netlify` retire `/admin` et il n’y a pas d’API.

Il faut **deux hébergements** :

| Composant | Où l’héberger | Rôle |
|-----------|---------------|------|
| `frontend/` | Netlify (Next.js complet) ou Vercel | Site + pages admin (UI) |
| `backend/` | Render, Railway, VPS… + **MySQL** | API, JWT, base de données |

Guide détaillé : **[docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md)**

### Netlify (recommandé pour le frontend)

Le `netlify.toml` à la racine utilise le plugin **@netlify/plugin-nextjs** et `npm run build` (admin inclus).

1. Déployer d’abord l’API NestJS et noter son URL HTTPS.
2. Sur Netlify → **Environment variables** : `NEXT_PUBLIC_API_URL` = `https://votre-api.example.com`
3. Sur le backend : `FRONTEND_URL` = `https://votre-site.netlify.app`
4. Déployer le site (push Git ou Deploy).

### Vitrine statique uniquement (sans admin)

```bash
cd frontend && npm run build:netlify
# → frontend/out/ — voir netlify.static.toml
```

Site exemple (mode statique) : https://heartfelt-gaufre-8c8694.netlify.app

## Prochaines étapes (roadmap)

1. Modèles : œuvres (tableaux), catégories, stock  
2. Authentification (admin peintre / clients)  
3. Panier et commandes  
4. Paiement (Stripe ou autre)  
5. Livraison et suivi  
