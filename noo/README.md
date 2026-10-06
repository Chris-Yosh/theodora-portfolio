# Noo — refonte de marque du site noo-mediation.fr

Refonte visuelle de la page d'accueil de https://www.noo-mediation.fr/.
**Structure et contenus inchangés** (mêmes sections, même ordre, mêmes textes, mêmes liens) : seuls la marque et le design évoluent.

Ouvrir `index.html` dans un navigateur, ou servir le dossier : `python3 -m http.server` puis http://localhost:8000.

## Identité
- **Palette** (dérivée de l'existant, plus saturée) : nuit `#15122e`, violet électrique `#4a2be0`, citron `#f5ee73`, mandarine `#ff5b1f`, lilas `#ece6ff`, crème `#fff8ee`, bordeaux `#5b1a14` (offre Délégation).
- **Typo** : Bricolage Grotesque (titres serrés, chiffres XXL) + Instrument Serif italique pour les mots d'accent (solution, désaccord, résoudre…), qui reprend les italiques du site actuel.
- **Logo** : mot-symbole « noo. » (point mandarine), décliné en géant dans le pied de page.

## Ce qui donne du peps
- Sections empilées en « feuilles » arrondies au lieu des vagues
- Pastille « dès 49€ » qui tourne, soulignement dessiné à la main, surligneur sur les mots-clés
- Comparatif reconstruit en HTML (au lieu d'une image) : compteurs animés, « vs » barré, anneau 70 %
- Chemin des 4 étapes qui se trace au défilement (au lieu de l'image du diagramme)
- Conversation MIA jouée message par message
- Bandeau « Apaiser les tensions, simplifier la vie » en défilement continu
- Cartes offres et témoignages animées au survol, boutons « magnétiques »
- Respecte `prefers-reduced-motion`, responsive jusqu'à 360 px

## Fichiers
- `index.html` — page d'accueil
- `assets/css/style.css` — design system et mise en page
- `assets/js/main.js` — interactions (sans dépendance)
- `assets/img/` — visuels du site actuel, recadrés et convertis en WebP

## Points à vérifier côté client
- Le lien du téléphone pointe vers `tel:0672214133` alors que le numéro affiché est 09.72.21.41.33 (repris tel quel du site actuel).
- Les boutons « MIA » ouvrent le widget Jotform s'il est présent sur la page, sinon la page de l'agent Jotform.
- Les liens pointent vers les pages existantes de noo-mediation.fr.
