# Déployer DahbiArt sur Railway (tout opérationnel)

Un seul projet Railway peut héberger : **MySQL + API NestJS + site Next.js**.

```
[Utilisateur] → https://web-xxx.up.railway.app (frontend)
                      ↓ appels API
                https://api-xxx.up.railway.app (backend)
                      ↓
                MySQL (plugin Railway)
```

---

## Étape 1 — Projet GitHub

1. [railway.app](https://railway.app) → **Login** → GitHub  
2. **New Project** → **Deploy from GitHub repo** → **DahbiArt**

---

## Étape 2 — Base MySQL

1. Dans le projet → **+ New** → **Database** → **MySQL**  
2. Attendez que MySQL soit **Active**  
3. Onglet **Variables** du service MySQL : notez `MYSQL_URL` (connexion interne, recommandée)

---

## Étape 3 — Service API (backend)

1. **+ New** → **GitHub Repo** → même repo **DahbiArt** (ou **Empty Service** puis lier le repo)  
2. **Settings** du service :
   - **Name** : `api` (ou `dahbiart-api`)
   - **Root Directory** : `backend`
3. **Variables** → **Add variable** (ou **Reference** depuis MySQL) :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `MYSQL_URL` | `${{MySQL.MYSQL_URL}}` *(référence au service MySQL — adaptez `MySQL` au nom affiché)* |
| `DB_SYNCHRONIZE` | `true` *(1er déploiement seulement, puis `false`)* |
| `JWT_SECRET` | longue chaîne aléatoire |
| `JWT_EXPIRES_IN` | `7d` |
| `ADMIN_EMAIL` | votre email admin |
| `ADMIN_PASSWORD` | mot de passe fort |
| `CHECKOUT_DEV_MODE` | `true` *(tests sans Stripe)* |
| `SHIPPING_DELAY_DAYS` | `3` |
| `FRONTEND_URL` | à remplir à l’étape 5 |

> Si la référence `${{MySQL.MYSQL_URL}}` ne fonctionne pas : copiez-collez la valeur brute de `MYSQL_URL` depuis l’onglet Variables du service MySQL.

4. **Settings** → **Networking** → **Generate Domain**  
5. Notez l’URL publique, ex. `https://api-production-xxxx.up.railway.app`  
6. **Deploy** → vérifiez : `https://VOTRE-API.up.railway.app/health`

Après succès : passez `DB_SYNCHRONIZE` à `false` et redéployez.

---

## Étape 4 — Service Web (frontend)

1. **+ New** → **GitHub Repo** → **DahbiArt**  
2. **Settings** :
   - **Name** : `web`
   - **Root Directory** : `frontend`
3. **Variables** :

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://VOTRE-API.up.railway.app` *(URL de l’étape 3, **sans** slash final)* |
| `NODE_VERSION` | `20` |

4. **Networking** → **Generate Domain**  
5. URL du site, ex. `https://web-production-xxxx.up.railway.app`

> `NEXT_PUBLIC_API_URL` est lue **au build**. Si vous changez l’URL API, **redéployez** le frontend.

---

## Étape 5 — CORS (relier front ↔ API)

Sur le service **api** → **Variables** :

```env
FRONTEND_URL=https://web-production-xxxx.up.railway.app
```

(Remplacez par l’URL réelle du service **web**, sans `/` final.)

**Redeploy** le service API.

---

## Étape 6 — Tests

| Test | URL |
|------|-----|
| Santé API | `/health` sur le domaine API |
| Site | domaine **web** |
| Connexion | `/login` |
| Admin | `/admin` (compte `ADMIN_EMAIL` / `ADMIN_PASSWORD`) |
| Inscription client | `/register` |

Console navigateur (F12) : pas d’erreur CORS ni `Failed to fetch`.

---

## Noms de services Railway

Les références du type `${{MySQL.MYSQL_URL}}` utilisent le **nom du service** dans Railway. Si votre base s’appelle `Postgres` ou `MySQL-abc`, cliquez sur le service → **Variables** → **Reference** pour insérer la bonne syntaxe.

---

## Netlify en parallèle ?

Vous pouvez garder **Netlify** pour le front et **Railway** seulement pour API + MySQL :

- Railway : services **MySQL** + **api** (étapes 2–3, 5)  
- Netlify : `NEXT_PUBLIC_API_URL` = URL Railway API  
- Railway `FRONTEND_URL` = URL Netlify  

Voir aussi [NETLIFY-RENDER.md](./NETLIFY-RENDER.md) (remplacer Render par Railway API).

---

## Stripe (production)

Sur le service **api** :

```env
CHECKOUT_DEV_MODE=false
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Webhook Stripe → `https://VOTRE-API.up.railway.app/...` (voir route webhook dans le code checkout).

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Build API échoue | Logs → vérifier `Root Directory` = `backend` |
| DB connection refused | `MYSQL_URL` référencé ; MySQL actif |
| CORS | `FRONTEND_URL` = URL **web** exacte |
| `Failed to fetch` | `NEXT_PUBLIC_API_URL` + redéploiement **web** |
| Tables manquantes | `DB_SYNCHRONIZE=true` une fois |
| API lente au réveil | Plan gratuit ; premier appel ~30 s |

---

## Fichiers utiles dans le repo

- `backend/railway.toml` — build / healthcheck API  
- `frontend/railway.toml` — build site  
- `backend/.env.example` — liste complète des variables  
