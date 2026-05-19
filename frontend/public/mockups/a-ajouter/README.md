# Ajouter vos mockups

Déposez **un dossier par scène** dans ce répertoire, puis lancez l’import.

## Structure attendue

```
a-ajouter/
  mon-salon/
    background.jpg    ← obligatoire (photo du mur avec cadre vide blanc)
    metadata.json     ← optionnel (réglages du placement)
```

- **Nom du dossier** = identifiant du mockup (ex. `mon-salon`, sans espaces).
- **Image** : JPG ou PNG, paysage conseillé (1920×1080 ou plus).
- Le cadre vide sur le mur doit être **blanc ou très clair** pour que l’œuvre s’y intègre bien.

## metadata.json (optionnel)

Copiez le fichier depuis `_modele/metadata.json` et adaptez :

| Champ | Description |
|-------|-------------|
| `name` | Nom affiché dans l’interface |
| `category` | `maison`, `commercial` ou `style` |
| `placement` | Zone du cadre vide (0 à 1) : `x`, `y`, `width`, `height` |
| `wallTone` | Couleur du cadre vide (ex. `#ffffff`) |
| `feather` | Adoucissement des bords (ex. `0.028`) |

## Importer dans le site

À la racine du dossier `frontend` :

```bash
npm run mockups:import
```

Les images sont copiées vers `public/mockups/<id>/` et le catalogue est mis à jour.

## Modifier un mockup existant (ex. salon-beige)

1. Remplacez l’image dans `public/mockups/salon-beige/` (`background.jpg` ou `background.png`).
2. Ajustez `metadata.json` si le cadre a bougé.
3. Synchronisez le catalogue :

```bash
npm run mockups:sync-paths
```

4. Rechargez la page produit (Ctrl+F5 si besoin).

## Mockups déjà actifs

Les scènes publiées se trouvent dans `public/mockups/` (ex. `salon-blanc/`, `chambre-douce/`).  
Ne modifiez pas ces dossiers directement : ajoutez plutôt une nouvelle scène via `a-ajouter/`.
