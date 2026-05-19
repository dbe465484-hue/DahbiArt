# Déploiement le plus simple possible (≈ 15 min de votre côté)

L’assistant ne peut pas ouvrir Netlify/Render à votre place, mais ce guide limite votre travail au strict minimum.

## Option 1 — Render Blueprint (API en 1 clic depuis GitHub)

1. [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints) → **New Blueprint Instance**
2. Repo **DahbiArt** → Render lit `render.yaml` à la racine
3. Créez une base **MySQL** (Railway / PlanetScale / autre) et copiez les identifiants
4. Au déploiement, Render demande les variables marquées `sync: false` :
   - `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`
   - `FRONTEND_URL` → mettez provisoirement `https://placeholder.netlify.app`, vous corrigerez après Netlify
5. Notez l’URL de l’API : `https://dahbiart-api.onrender.com` (nom peut varier)
6. Test : `/health`

Après le 1er déploiement réussi : dans Render → Environment → `DB_SYNCHRONIZE` = `false` → Redeploy.

## Option 2 — Netlify (frontend, 3 clics)

1. [app.netlify.com](https://app.netlify.com) → **Import from Git** → **DahbiArt**
2. Netlify détecte `netlify.toml` (rien à changer)
3. **Environment variables** → ajoutez une seule ligne :
   - `NEXT_PUBLIC_API_URL` = URL Render de l’étape 1
4. **Deploy**

## Option 3 — Relier (1 variable)

Render → `FRONTEND_URL` = votre URL Netlify réelle → **Save** (redéploiement auto).

## Test final

- `https://VOTRE-SITE.netlify.app/login`
- Admin : email/mot de passe définis sur Render (`ADMIN_EMAIL` / `ADMIN_PASSWORD` ou valeur générée dans Render → Environment)

---

## Ce que l’assistant peut encore faire pour vous (dans le code)

- Corriger les erreurs de build Netlify/Render si vous collez le log
- Ajouter Stripe, SMTP, domaine personnalisé
- Préparer Railway « tout-en-un » (API + MySQL + front) si vous préférez **un seul** fournisseur

## Ce que seul vous pouvez faire

- Connexion GitHub aux tableaux de bord
- Mots de passe base de données (ne jamais les commiter dans Git)
- Carte bancaire / validation email des hébergeurs si demandé
