# Noo — refonte de marque du site noo-mediation.fr

Refonte visuelle de la page d'accueil de https://www.noo-mediation.fr/.
**Structure et contenus inchangés** (mêmes sections, même ordre, mêmes textes, mêmes liens) : seuls la marque et le design évoluent.

Ouvrir `index.html` dans un navigateur, ou servir le dossier : `python3 -m http.server` puis http://localhost:8000.

## Identité — « Deux cercles »
La médiation, c'est deux parties qui se rapprochent. Les deux « o » de *noo* deviennent deux cercles ; leur intersection — l'accord — est la seule touche de couleur vive du site. Ce symbole sert de logo, d'intro, de pictogramme pour les étapes (les cercles se rapprochent jusqu'à l'accord) et de signature géante en pied de page.

- **Palette** : papier `#f3efe7`, encre `#161512`, sable `#e8e1d3`, vert forêt `#1d322c`, brume `#c9d4c6`, argile `#c8573a` (accent unique).
- **Typo** : Instrument Serif (titres, chiffres), Geist (texte), Geist Mono (repères, petites étiquettes).
- **Mise en page** : éditoriale, filets fins, beaucoup d'air, sections numérotées (01)…(05).

## Animations
- Intro : les deux cercles se rejoignent, puis le rideau se lève
- Titres révélés mot à mot, images dévoilées par un rideau avec léger zoom et parallaxe
- Phrase manifeste qui s'allume mot à mot au défilement
- Compteurs, barre de réussite, fil des étapes qui se trace au défilement
- Conversation MIA jouée message par message
- Offres : fond encre qui monte au survol ; boutons avec bulle argile et flèche qui défile
- Témoignages en fondu avec barre de progression, bandeau « Apaiser les tensions » en défilement lent
- Défilement doux (Lenis, chargé depuis jsDelivr ; le site marche sans)
- Tout est désactivé si `prefers-reduced-motion` est activé

## Fichiers
- `index.html` — page d'accueil
- `assets/css/style.css` — design system et mise en page
- `assets/js/main.js` — interactions (sans dépendance)
- `assets/img/` — visuels du site actuel, recadrés et convertis en WebP

## Points à vérifier côté client
- Le lien du téléphone pointe vers `tel:0672214133` alors que le numéro affiché est 09.72.21.41.33 (repris tel quel du site actuel).
- Les boutons « MIA » ouvrent le widget Jotform s'il est présent sur la page, sinon la page de l'agent Jotform.
- Les liens pointent vers les pages existantes de noo-mediation.fr.
