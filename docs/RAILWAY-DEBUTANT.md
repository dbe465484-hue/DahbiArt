# Railway — guide ultra simple (DahbiArt)

## Pourquoi ça a échoué ?

Votre projet GitHub contient **2 applications** dans le même repo :

```
DahbiArt/
├── backend/    ← l’API (NestJS)
├── frontend/   ← le site (Next.js)
└── README.md
```

Railway a ouvert le repo **à la racine** et s’est dit : « Je ne vois pas quoi lancer » → **échec du build**.

Ce n’est **pas** un bug de votre code. Il manque juste : **« construis le dossier backend »** ou **« construis le dossier frontend »**.

---

## Ce qu’il vous faut sur Railway (3 blocs)

| # | Bloc | Rôle | Dossier à indiquer |
|---|------|------|-------------------|
| 1 | **MySQL** | Base de données | *(automatique)* |
| 2 | **API** | Connexion, commandes, admin | `backend` |
| 3 | **Site web** | Pages visibles dans le navigateur | `frontend` |

**Un seul service ne peut pas faire les deux** (backend + frontend) sans choisir un dossier.

---

## Étape A — Corriger le service actuel (API)

Sur l’écran rouge **Failed** avec le bouton violet **Set root directory** :

1. Cliquez **Set root directory**
2. Dans le champ, tapez exactement : **`backend`**
3. Enregistrez
4. Cliquez **Deploy** ou attendez le redéploiement automatique

Quand c’est bon : l’onglet **Deployments** affiche **Success** (vert).

5. Ouvrez **Settings** → **Networking** → **Generate Domain**  
   Vous obtenez une URL du type : `https://dahbiart-production-xxxx.up.railway.app`

6. Testez dans le navigateur :  
   `https://VOTRE-URL-API/health`  
   → doit répondre (pas une page blanche d’erreur).

### Variables pour l’API (onglet Variables)

Minimum à ajouter :

| Nom | Valeur |
|-----|--------|
| `MYSQL_URL` | Cliquez **Add reference** → choisissez votre service **MySQL** → variable `MYSQL_URL` |
| `DB_SYNCHRONIZE` | `true` *(première fois seulement)* |
| `JWT_SECRET` | une phrase secrète longue (ex. `MaCleSecrete2026DahbiArt!`) |
| `ADMIN_EMAIL` | votre email |
| `ADMIN_PASSWORD` | mot de passe admin |
| `CHECKOUT_DEV_MODE` | `true` |
| `FRONTEND_URL` | on le remplit à l’étape C |

Après le 1er succès : repassez `DB_SYNCHRONIZE` à `false`.

---

## Étape B — Ajouter le site (frontend)

1. Retour au **projet** Railway (pas dans un seul service)
2. **+ New** → **GitHub Repo** → **DahbiArt** (même repo)
3. Un **nouveau** service apparaît
4. **Settings** → **Root Directory** → tapez : **`frontend`**
5. **Variables** :
   - `NEXT_PUBLIC_API_URL` = l’URL de l’API de l’étape A  
     Exemple : `https://dahbiart-production-xxxx.up.railway.app`  
     **Sans** `/` à la fin
6. **Networking** → **Generate Domain** → URL du site

---

## Étape C — Relier site et API

1. Retournez sur le service **API** (backend)
2. **Variables** → `FRONTEND_URL` = URL du site (étape B)  
   Exemple : `https://web-production-xxxx.up.railway.app`
3. **Deploy** (redéploiement)

---

## Étape D — Tester

Ouvrez l’URL du **site** (frontend) :

- Page d’accueil
- `/login` → connexion
- `/admin` → admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)

Si erreur **Failed to fetch** dans F12 : vérifiez `NEXT_PUBLIC_API_URL` et redéployez le **frontend**.

---

## Résumé en 1 image mentale

```
[Navigateur]  →  service WEB (dossier frontend)
                      ↓
                 service API (dossier backend)
                      ↓
                 MySQL
```

---

## Vous n’avez pas encore MySQL ?

1. Projet Railway → **+ New** → **Database** → **MySQL**
2. Attendez **Active**
3. Sur le service **API** → Variables → référence `MYSQL_URL` depuis MySQL

---

## Besoin d’aide ?

Dites où vous bloquez :

- « J’ai mis backend mais ça échoue encore » → copiez les **Build Logs**
- « /health ne marche pas » → capture Variables API
- « Le site s’affiche mais pas la connexion » → URL du site + URL API
