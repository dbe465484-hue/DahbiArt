# Publier Mayn sur GitHub

## 1. Créer le dépôt sur GitHub

1. Allez sur [github.com/new](https://github.com/new)
2. **Repository name** : par ex. `mayn` ou `mayn-galerie`
3. **Visibilité** : Private (recommandé) ou Public
4. **Ne cochez pas** « Add a README » — le projet en a déjà un
5. Cliquez sur **Create repository**

Notez l’URL affichée, par ex. `https://github.com/VOTRE-PSEUDO/mayn.git`

## 2. Premier envoi depuis votre PC

Dans PowerShell, à la racine du projet (`Mayn`) :

```powershell
cd C:\Users\RimBelabadia\Desktop\Mayn

# Branche principale (convention GitHub)
git branch -M main

# Lier votre dépôt GitHub (remplacez l’URL)
git remote add origin https://github.com/VOTRE-PSEUDO/mayn.git

# Envoyer le code
git push -u origin main
```

Si `origin` existe déjà :

```powershell
git remote set-url origin https://github.com/VOTRE-PSEUDO/mayn.git
git push -u origin main
```

## 3. Connexion GitHub (authentification)

Au premier `git push`, Windows peut ouvrir une fenêtre de connexion GitHub.

Sinon, utilisez un **Personal Access Token** :

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens**
2. Créez un token avec la permission `repo`
3. Lors du `git push`, identifiant = votre pseudo GitHub, mot de passe = le token

## 4. Fichiers jamais envoyés sur GitHub

Grâce au `.gitignore`, ces fichiers restent **uniquement sur votre machine** :

- `backend/.env` (mots de passe DB, Stripe, SMTP, JWT…)
- `frontend/.env.local`
- `node_modules/`
- builds (`dist/`, `.next/`)

Les modèles sont versionnés : `backend/.env.example`, `frontend/.env.example`.

## 5. Mises à jour suivantes

```powershell
git add .
git status
git commit -m "Description de vos changements"
git push
```

## 6. Déploiement (rappel)

Voir [DEPLOIEMENT.md](./DEPLOIEMENT.md) : variables `NEXT_PUBLIC_API_URL`, `FRONTEND_URL`, base MySQL, Stripe, etc. à configurer sur Netlify / hébergeur API — pas dans le dépôt Git.
